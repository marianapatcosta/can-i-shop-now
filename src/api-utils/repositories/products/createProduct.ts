import { ApiError, ProductInfoDB, ProductUserInfo } from '@/types'
import { prisma } from '@/api-utils/lib/prisma'
import {
  failedDataBaseAccessErrorHandler,
  getStore,
  isProductUpdated,
  orderSizes,
} from '@/api-utils/utils'
import { scrapeProduct } from '@/api-utils/product-scrappers'
import {
  PRODUCT_NOT_EXIST,
  SIZES_NOT_AVAILABLE,
  SIZE_UNIQUE,
  USER_ALREADY_WATCHING_PRODUCT_ERROR,
} from '@/api-utils/constants'
import { updateProduct } from './updateProduct'

export const createProduct = async (
  userId: string,
  url: string,
  sizesToWatch: string
): Promise<ProductUserInfo> => {
  try {
    const store = getStore(url)
    const product = (await scrapeProduct(store)(url, true)) as ProductInfoDB

    if (!product) {
      throw new ApiError(PRODUCT_NOT_EXIST(url), 404)
    }

    const orderedSizesToWatch =
      product.allSizes === SIZE_UNIQUE
        ? [SIZE_UNIQUE]
        : orderSizes(sizesToWatch.toUpperCase().split(','))
    const allSizes = product.allSizes.split(',')
    const sizesNotAvailable =
      product.allSizes === SIZE_UNIQUE
        ? []
        : orderedSizesToWatch.filter((size) => !allSizes.includes(size))

    if (!!sizesNotAvailable.length) {
      throw new ApiError(SIZES_NOT_AVAILABLE(sizesNotAvailable, url), 400)
    }

    let productInDB = (await prisma.product.findFirst({
      where: {
        productId: product.id,
        store,
      },
    })) as ProductInfoDB

    if (!productInDB) {
      productInDB = (await prisma.product.create({
        data: {
          productId: product.id,
          store,
          name: product.name,
          url,
          originalPrice: product.originalPrice,
          currentPrice: product.currentPrice,
          currency: product.currency,
          allSizes: product.allSizes,
          availableSizes: product.availableSizes,
          photoUrl: product.photoUrl || '',

          productUser: {
            create: {
              sizesToWatch: orderedSizesToWatch.join(','),
              user: {
                connect: {
                  id: userId,
                },
              },
            },
          },

          productHistory: {
            create: {
              originalPrice: product.originalPrice,
              currentPrice: product.currentPrice,
              availableSizes: product.availableSizes,
            },
          },
        },
      })) as ProductInfoDB

      return {
        ...productInDB,
        sizesToWatch,
      }
    }

    if (isProductUpdated(product, productInDB)) {
      await updateProduct(productInDB.id, product)
    }

    let productUser = await prisma.productUser.findUnique({
      where: {
        productId_userId: {
          userId,
          productId: productInDB.id,
        },
      },
    })

    if (!!productUser) {
      throw new ApiError(USER_ALREADY_WATCHING_PRODUCT_ERROR(userId, url), 400)
    }

    productUser = await prisma.productUser.create({
      data: {
        sizesToWatch: orderedSizesToWatch.join(','),
        user: {
          connect: {
            id: userId,
          },
        },
        product: {
          connect: { id: productInDB.id },
        },
      },
    })

    return {
      ...productInDB,
      sizesToWatch: sizesToWatch,
    }
  } catch (error) {
    return failedDataBaseAccessErrorHandler('createProduct', error)
  }
}
