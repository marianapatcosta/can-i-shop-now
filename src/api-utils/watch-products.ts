import {
  ConverterOperation,
  PartialProductInfoDB,
  ProductInfo,
  ProductInfoDB,
  ProductUser,
  SendEmailUser,
} from '@/types'
import { PromisePool } from '@supercharge/promise-pool'
import { prisma } from './lib/prisma'
import { scrapeProduct } from './product-scrappers'
import { pascalCaseToSentenceCase, unitToCentConverter } from '@/utils'
import { getFormattedPrice, isProductUpdated } from './utils'
import { getProductsUsers } from './repositories/products/getProductsUsers'
import { updateProduct } from './repositories/products/updateProduct'
import { sendEmail } from './send-email'

const CONCURRENCY = 10

export const watchProducts = async () => {
  let timerId: ReturnType<typeof setTimeout> | undefined
  if (!process.env.IS_WATCHER_ON) {
    !!timerId && clearTimeout(timerId)
    return
  }
  const TIME_INTERVALS = process.env.TIME_INTERVALS?.split(',') ?? ''

  const timeInterval = Number(
    TIME_INTERVALS[Math.round(Math.random() * TIME_INTERVALS.length)]
  )

  timerId = setTimeout(async () => {
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
      //watchPrices()
    } catch (error) {
      console.error(error)
    }
  }, 1000 /* timeInterval */)
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
