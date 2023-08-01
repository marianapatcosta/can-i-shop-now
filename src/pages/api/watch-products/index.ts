import type { NextApiRequest, NextApiResponse } from 'next'
import {
  ApiError,
  ConverterOperation,
  HttpRequestMethod,
  PartialProductInfoDB,
  ProductInfo,
  ProductInfoDB,
  ProductUser,
  SendEmailUser,
} from '@/types'
import { PromisePool } from '@supercharge/promise-pool'
import { prisma } from '@/api-utils/lib/prisma'
import { scrapeProduct } from '@/api-utils/product-scrappers'
import { pascalCaseToSentenceCase, unitToCentConverter } from '@/utils'
import { getFormattedPrice, isProductUpdated } from '@/api-utils/utils'
import { getProductsUsers } from '@/api-utils/repositories/products/getProductsUsers'
import { updateProduct } from '@/api-utils/repositories/products/updateProduct'
import { sendEmail } from '@/api-utils//send-email'
import { logger } from '@/api-utils/logger'
import { FAILED_REQUEST_ERROR } from '@/api-utils/constants'

const CONCURRENCY = 10

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<{ message: string } | Error>
) {
  if (request.method !== HttpRequestMethod.GET)
    return response.status(405).json({ message: 'Method Not Allowed' })

  try {
    const products = (await prisma.product.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        productUser: {
          select: { sizesToWatch: true },
        },
      },
    })) as ProductInfoDB[]

    const { results: updatedProducts } = await PromisePool.for(products)
      .withConcurrency(CONCURRENCY)
      .process(async (product) => {
        const updatedProduct = await scrapeProduct(product.store)(
          product.url,
          false
        )
        return {
          ...updatedProduct,
          dbId: product.id,
        }
      })

    const productsWithUpdates = updatedProducts.filter((updatedProduct) =>
      isProductUpdated(
        updatedProduct,
        products.find((product) => product.id === updatedProduct.dbId)!
      )
    )

    if (!!productsWithUpdates.length) {
      onProductsWithUpdates(productsWithUpdates)
    }

    return response.status(200).json({
      message: !!productsWithUpdates.length
        ? `Product(s) with id(s) ${productsWithUpdates
            .map(({ dbId }) => dbId)
            .join(', ')} was/were updated.`
        : 'No products were updated.',
    })
  } catch (error) {
    logger.error(FAILED_REQUEST_ERROR('watch-products', error))

    if (error instanceof ApiError) {
      return response.status(error.statusCode).json({
        message: error.message,
      })
    }

    return response.status(500).json({
      message: `An error occurred.`,
    })
  }
}

const onProductsWithUpdates = async (
  productsWithUpdates: ((ProductInfo | PartialProductInfoDB) & {
    dbId: string
  })[]
) => {
  const { results: updatedProductsInDB } = await PromisePool.for(
    productsWithUpdates
  )
    .withConcurrency(CONCURRENCY)
    .process(async (product) => {
      return await updateProduct(product.dbId, {
        currentPrice: product.currentPrice,
        availableSizes: product.availableSizes,
        originalPrice: product.originalPrice,
      })
    })

  const { results: productUsers } = await PromisePool.for(updatedProductsInDB)
    .withConcurrency(CONCURRENCY)
    .process(async (product) => {
      return await getProductsUsers(product.id)
    })

  const userWithProducts = groupAvailableProductByUser(productUsers.flat())

  await PromisePool.for(userWithProducts)
    .withConcurrency(CONCURRENCY)
    .process(async (user) => {
      await sendEmail(user.products, user.email)
    })
}

const groupAvailableProductByUser = (productUsers: ProductUser[]) => {
  const productsByUser = productUsers.reduce(
    (userWithProducts, currentProductUser) => {
      if (userWithProducts[currentProductUser.user.id]) {
        userWithProducts[currentProductUser.user.id].products = [
          ...userWithProducts[currentProductUser.user.id].products,
          getFormattedProduct(currentProductUser.product),
        ]
        return userWithProducts
      }

      userWithProducts[currentProductUser.user.id] = {
        id: currentProductUser.user.id,
        email: currentProductUser.user.email,
        products: [getFormattedProduct(currentProductUser.product)],
      }
      return userWithProducts
    },
    {} as { [key: string]: SendEmailUser }
  )

  return Object.values(productsByUser)
}

const getFormattedProduct = (product: ProductUser['product']) => ({
  ...product,
  store: pascalCaseToSentenceCase(product.store),
  currentPrice: getFormattedPrice(
    'en-EN',
    unitToCentConverter(product.currentPrice, ConverterOperation.ToUnit),
    product.currency
  ),
})
