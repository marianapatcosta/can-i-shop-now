import { User } from '@prisma/client'
import { USER_NOT_FOUND_ERROR } from '@/api-utils/constants'
import { prisma } from '@/api-utils/lib/prisma'
import { failedDataBaseAccessErrorHandler } from '@/api-utils/utils'
import { ApiError } from '@/types'

export const getUser = async (userId: string): Promise<User> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      throw new ApiError(USER_NOT_FOUND_ERROR(userId), 404)
    }

    return user
  } catch (error) {
    return failedDataBaseAccessErrorHandler('getUser', error)
  }
}
