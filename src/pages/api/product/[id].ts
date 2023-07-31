import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { ProductUser } from '@prisma/client'
import {
  ApiError,
  HttpRequestMethod,
  MySession,
  ProductUserInfo,
} from '@/types'
import { getProduct } from '@/api-utils/repositories/products/getProductUser'
import { deleteProduct } from '@/api-utils/repositories/products/deleteProduct'
import { updateProductUser } from '@/api-utils/repositories/products/updateProductUser'
import { logger } from '@/api-utils/logger'
import { FAILED_REQUEST_ERROR } from '@/api-utils/constants'
import { authOptions } from '../auth/[...nextauth]'

type Data = {
  product: ProductUserInfo | ProductUser
}

type Error = {
  message: string
}

const manageProductParams = z.object({
  id: z.string(),
})

const updateProductBody = z.object({
  sizesToWatch: z.string(),
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
    const userId = session.user?.id
    const { id } = manageProductParams.parse(request.query)

    if (request.method === HttpRequestMethod.GET) {
      const product = await getProduct(userId, id)

      return response.status(200).json({
        product,
      })
    }

    if (request.method === HttpRequestMethod.PATCH) {
      const { sizesToWatch } = updateProductBody.parse(request.body)
      const updatedProduct = await updateProductUser(userId, id, sizesToWatch)

      return response.status(200).json({
        product: updatedProduct,
      })
    }

    if (request.method === HttpRequestMethod.DELETE) {
      deleteProduct(userId, id)

      return response.status(200).json({
        message: `Product with id ${id} was deleted for user ${userId}.`,
      })
    }
    return response.status(405).json({ message: 'Method Not Allowed' })
  } catch (error) {
    logger.error(FAILED_REQUEST_ERROR('product/[id]', error))
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
