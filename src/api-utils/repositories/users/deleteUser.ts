import { ApiError } from '@/types'
import { prisma } from '@/api-utils/lib/prisma'
import { USER_NOT_FOUND_ERROR } from '@/api-utils/constants'
import { failedDataBaseAccessErrorHandler } from '@/api-utils/utils'

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const deletedUser = await prisma.user.delete({
      where: {
        id: userId,
      },
    })

    if (!deletedUser) {
      throw new ApiError(USER_NOT_FOUND_ERROR(userId), 404)
    }
  } catch (error) {
    return failedDataBaseAccessErrorHandler('deleteProduct', error)
  }
}
