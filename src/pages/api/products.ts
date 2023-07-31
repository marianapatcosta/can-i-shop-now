import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import {
  HttpRequestMethod,
  MySession,
  OrderBy,
  ProductUserInfo,
  Sort,
  SortBy,
} from '@/types'
import { getProductsByUser } from '@/api-utils/repositories/products/getProductsByUser'
import { FAILED_REQUEST_ERROR } from '@/api-utils/constants'
import { logger } from '@/api-utils/logger'
import { authOptions } from './auth/[...nextauth]'
import { watchProducts } from '@/api-utils/watch-products'

type Data = {
  products: ProductUserInfo[]
  count: number
}

type Error = {
  message: string
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<Data | Error>
) {
  // watchPrices()
  if (request.method !== HttpRequestMethod.GET)
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

    const getUserProductsParams = z.object({
      orderBy: z.nativeEnum(OrderBy).optional(),
      sortBy: z.nativeEnum(SortBy).optional(),
      offset: z.string().regex(/^\d+$/).transform(Number).optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    })

    const {
      orderBy = OrderBy.DESC,
      sortBy = SortBy.Updated_AT,
      offset = 0,
      limit = 10,
    } = getUserProductsParams.parse(request.query)
    const { products, count } = await getProductsByUser(
      session.user?.id,
      {
        [sortBy]: orderBy,
      } as Sort,
      offset,
      limit
    )
    return response.status(200).json({
      products,
      count,
    })
  } catch (error) {
    logger.error(FAILED_REQUEST_ERROR('products', error))

    if (error instanceof z.ZodError) {
      return response.status(400).json({
        message: `Invalid parameters`,
      })
    }

    return response.status(500).json({
      message: `An error occurred.`,
    })
  }
}
