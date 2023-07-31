import { ProductUser } from '@prisma/client'
import { ApiError } from '@/types'
import { prisma } from '@/api-utils/lib/prisma'
import {
  PRODUCT_NOT_FOUND_ERROR,
  SIZES_NOT_AVAILABLE,
  SIZE_UNIQUE,
} from '@/api-utils/constants'
import { failedDataBaseAccessErrorHandler, orderSizes } from '@/api-utils/utils'
import { getProduct } from './getProductUser'

export const updateProductUser = async (
  userId: string,
  productId: string,
  sizesToWatch: string
): Promise<ProductUser> => {
  try {
    const product = await getProduct(userId, productId)
    const orderedSizesToWatch =
      product.allSizes === SIZE_UNIQUE
        ? [SIZE_UNIQUE]
        : orderSizes(sizesToWatch.toUpperCase().split(','))

    const sizesNotAvailable =
      product.allSizes === SIZE_UNIQUE
        ? []
        : orderedSizesToWatch.filter((size) => !product.allSizes.includes(size))

    if (!!sizesNotAvailable.length) {
      throw new ApiError(
        SIZES_NOT_AVAILABLE(sizesNotAvailable, product.url),
        400
      )
    }

    const updatedProductUser = await prisma.productUser.update({
      where: {
        productId_userId: {
          userId,
          productId,
        },
      },
      data: {
        sizesToWatch: orderedSizesToWatch.join(','),
      },
    })

    if (!updatedProductUser) {
      throw new ApiError(PRODUCT_NOT_FOUND_ERROR(userId, productId), 404)
    }
    return updatedProductUser
  } catch (error) {
    return failedDataBaseAccessErrorHandler('updateProductUser', error)
  }
}
