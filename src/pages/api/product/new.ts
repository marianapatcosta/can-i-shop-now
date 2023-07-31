import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { ApiError, HttpRequestMethod, MySession, ProductUserInfo, Store } from '@/types'
import { FAILED_REQUEST_ERROR } from '@/api-utils/constants'
import { isUrl } from '@/api-utils/utils'
import { createProduct } from '@/api-utils/repositories/products/createProduct'
import { logger } from '@/api-utils/logger'
import { authOptions } from '../auth/[...nextauth]'

type Data = {
  product: ProductUserInfo
}

type Error = {
  message: string
}

const createProductBody = z.object({
  url: z.string(),
  sizesToWatch: z.string(),
})

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<Data | Error>
) {
  if (request.method !== HttpRequestMethod.POST)
    return response.status(405).json({ message: 'Method Not Allowed' })

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
    const { url, sizesToWatch } = createProductBody.parse(request.body)
    
    if (!isUrl(url)) {
      return response.status(400).json({
        message: `Invalid url!`,
      })
    }

    const product = await createProduct(userId, url, sizesToWatch)

    return response.status(201).json({
      product,
    })
  } catch (error) {
    logger.error(FAILED_REQUEST_ERROR('product/new', error))

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
