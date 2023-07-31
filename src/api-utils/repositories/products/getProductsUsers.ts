import { prisma } from '@/api-utils/lib/prisma'
import { failedDataBaseAccessErrorHandler } from '@/api-utils/utils'
import { ProductUser } from '@/types'

export const getProductsUsers = async (productId: string): Promise<ProductUser[]> => {
  try {
    return await prisma.productUser.findMany({
      where: {
        productId,
      },
      include: {
        product: {
          select: {
            id: true,
            url: true,
            name: true,
            photoUrl: true,
            store: true,
            availableSizes: true,
            currentPrice: true,
            currency: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })
  } catch (error) {
    return failedDataBaseAccessErrorHandler('getProductsUsers', error)
  }
}
