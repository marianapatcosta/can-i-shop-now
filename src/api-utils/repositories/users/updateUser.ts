import { User } from '@prisma/client'
import { prisma } from '@/api-utils/lib/prisma'
import { failedDataBaseAccessErrorHandler } from '@/api-utils/utils'

export const updateUser = async (
  userId: string,
  updatedUser: { zipCode: string; city: string }
): Promise<User> => {
  try {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        zipCode: updatedUser.zipCode,
        city: updatedUser.city,
      },
    })
  } catch (error) {
    return failedDataBaseAccessErrorHandler('updateUser', error)
  }
}
