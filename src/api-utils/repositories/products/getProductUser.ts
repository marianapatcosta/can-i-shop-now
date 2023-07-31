import { PRODUCT_NOT_FOUND_ERROR } from '@/api-utils/constants'
import { prisma } from '@/api-utils/lib/prisma'
import { failedDataBaseAccessErrorHandler } from '@/api-utils/utils'
import { ApiError, ProductUserInfo } from '@/types'

export const getProduct = async (
  userId: string,
  productId: string
): Promise<ProductUserInfo> => {
  try {
    const productUser = await prisma.productUser.findUnique({
      where: {
        productId_userId: {
          userId,
          productId,
        },
      },
      include: {
        product: {
          include: {
            productHistory: {
              select: {
                originalPrice: true,
                currentPrice: true,
                availableSizes: true,
                createdAt: true,
              },
            },
          },
        },
      },
    })

    if (!productUser) {
      throw new ApiError(PRODUCT_NOT_FOUND_ERROR(userId, productId), 404)
    }

    return {
      ...productUser.product,
      sizesToWatch: productUser.sizesToWatch,
    }
  } catch (error) {
    return failedDataBaseAccessErrorHandler('getProduct', error)
  }
}
