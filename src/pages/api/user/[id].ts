import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { User } from '@prisma/client'
import { ApiError, HttpRequestMethod, MySession } from '@/types'
import { logger } from '@/api-utils/logger'
import { FAILED_REQUEST_ERROR } from '@/api-utils/constants'
import { getUser } from '@/api-utils/repositories/users/getUser'
import { updateUser } from '@/api-utils/repositories/users/updateUser'
import { deleteUser } from '@/api-utils/repositories/users/deleteUser'
import { authOptions } from '../auth/[...nextauth]'

type Data = {
  user: User
}

type Error = {
  message: string
}

const manageUserParams = z.object({
  id: z.string(),
})

const updateUserBody = z.object({
  zipCode: z.string(),
  city: z.string(),
})

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<Data | Error>
) {
  try {
    const session: MySession | null = await getServerSession(
      request,
      response,
      authOptions
    )
    if (!session) {
      return response.status(401).json({ message: 'Unauthorized' })
    }

    const { id } = manageUserParams.parse(request.query)
    const userId = session.user?.id

    if (id !== userId) {
      return response.status(401).json({ message: 'Unauthorized' })
    }

    if (request.method === HttpRequestMethod.GET) {
      const user = await getUser(userId)

      return response.status(200).json({
        user,
      })
    }

    if (request.method === HttpRequestMethod.PATCH) {
      const userData = updateUserBody.parse(request.body)
      const updatedUser = await updateUser(userId, userData)

      return response.status(200).json({
        user: updatedUser,
      })
    }

    if (request.method === HttpRequestMethod.DELETE) {
      deleteUser(userId)

      return response.status(200).json({
        message: `User with id ${userId} was deleted.`,
      })
    }
    return response.status(405).json({ message: 'Method Not Allowed' })
  } catch (error) {
    logger.error(FAILED_REQUEST_ERROR('user/[id]', error))
    if (error instanceof z.ZodError) {
      return response.status(400).json({
        message: `Invalid parameters`,
      })
    }

    if (error instanceof ApiError) {
      return response.status(error.statusCode).json({
        message: error.message,
      })
    }

    return response.status(500).json({
      message: `An error occurred.`,
    })
  }
}
