import { ProductInfoDB, PartialProductInfoDB } from '@/types'
import { prisma } from '@/api-utils/lib/prisma'
import { failedDataBaseAccessErrorHandler } from '@/api-utils/utils'

export const updateProduct = async (
  productId: string,
  updatedProduct: PartialProductInfoDB & { dbId?: string }
): Promise<ProductInfoDB> => {
  try {
    return (await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        currentPrice: updatedProduct.currentPrice,
        availableSizes: updatedProduct.availableSizes,
        originalPrice: updatedProduct.originalPrice,

        productHistory: {
          create: {
            originalPrice: updatedProduct.originalPrice,
            currentPrice: updatedProduct.currentPrice,
            availableSizes: updatedProduct.availableSizes,
          },
        },
      },
    })) as ProductInfoDB
  } catch (error) {
    return failedDataBaseAccessErrorHandler('updateProduct', error)
  }
}
