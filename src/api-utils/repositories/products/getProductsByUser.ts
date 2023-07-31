import { prisma } from '@/api-utils/lib/prisma'
import { failedDataBaseAccessErrorHandler } from '@/api-utils/utils'
import { ProductUserInfo, ProductInfoDB, Sort } from '@/types'

const formatProducts = (products: ProductInfoDB[]): ProductUserInfo[] => {
  return products.map((product: ProductInfoDB) => {
    const updatedProduct = {
      ...product,
      sizesToWatch: product.productUser?.length
        ? product.productUser[0].sizesToWatch
        : '',
    }
    delete updatedProduct.productUser
    return updatedProduct
  })
}

export const getProductsByUser = async (
  userId: string,
  orderBy: Sort,
  skip: number,
  take: number
): Promise<{ products: ProductUserInfo[]; count: number }> => {
  try {
    const [count, products] = await prisma.$transaction([
      prisma.product.count({
        where: {
          productUser: {
            some: {
              userId,
            },
          },
        },
      }),
      prisma.product.findMany({
        orderBy,
        skip,
        take,
        where: {
          productUser: {
            some: {
              userId,
            },
          },
        },
        include: {
          productUser: {
            where: {
              userId,
            },
            select: { sizesToWatch: true },
          },
        },
      }),
    ])  

    return { count, products: formatProducts(products as ProductInfoDB[]) }
  } catch (error) {
    return failedDataBaseAccessErrorHandler('getProductsByUser', error)
  }
}
