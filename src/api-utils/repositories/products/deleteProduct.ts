import { ApiError } from '@/types'
import { prisma } from '@/api-utils/lib/prisma'
import { PRODUCT_NOT_FOUND_ERROR } from '@/api-utils/constants'
import { failedDataBaseAccessErrorHandler } from '@/api-utils/utils'

export const deleteProduct = async (
  userId: string,
  productId: string
): Promise<void> => {
  try {
    const deletedProductUser = await prisma.productUser.delete({
      where: {
        productId_userId: {
          userId,
          productId,
        },
      },
    })

    if (!deletedProductUser) {
      throw new ApiError(PRODUCT_NOT_FOUND_ERROR(userId, productId), 404)
    }

    // Delete product, if no more users are watching it
    const productUser = await prisma.productUser.findMany({
      where: {
        productId,
      },
    })

    if (!productUser.length) {
      await prisma.product.delete({
        where: {
          id: productId,
        },
      })
    }
  } catch (error) {
    return failedDataBaseAccessErrorHandler('deleteProduct', error)
  }
}
