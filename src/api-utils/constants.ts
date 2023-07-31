import { Store } from '@/types'

export const FAILED_SCRAPPER_DATA_FETCH_ERROR = (
  store: Store,
  url: string,
  error: unknown
): string =>
  `Failed to fetch data from ${store} (url: ${url}): Error: ${error}.`

export const FAILED_DB_ACCESS_ERROR = (
  dbActionName: string,
  error: unknown
): string =>
  `Failed while executing DB action ${dbActionName}: Error: ${error}.`

export const FAILED_REQUEST_ERROR = (request: string, error: unknown): string =>
  `Failed during the request ${request}: Error: ${error}.`

export const SEND_EMAIL_SUCCESS = (email: string, productsIds: string) =>
  `An email was sent to ${email}, notifying about products ${productsIds}.`

export const SEND_EMAIL_ERROR = (email: string, error: unknown): string =>
  `Failed to send e-mail to ${email}: Error: ${JSON.stringify(error)}.`

export const STORE_NOT_SUPPORTED_ERROR = (url: string): string =>
  `Store not supported for the URL ${url}.`

export const PRODUCT_NOT_FOUND_ERROR = (
  userId: string,
  productId: string
): string => `Product ${productId} not found for user ${userId}.`

export const USER_NOT_FOUND_ERROR = (userId: string): string =>
  `User ${userId} not found.`

export const PRODUCT_NOT_EXIST = (url: string): string =>
  `Product not found for the provided URL ${url}.`

export const SIZES_NOT_AVAILABLE = (sizes: string[], url: string): string =>
  `Size(s) ${sizes.join(',')} not available for product with URL ${url}.`

export const USER_ALREADY_WATCHING_PRODUCT_ERROR = (
  userId: string,
  url: string
): string => `User ${userId} is already watching the product of URL ${url}.`

export const SIZE_PRIORITY: { [key: string]: number } = {
  XXS: 0,
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
  XXL: 6,
  XXXL: 7,
}

export const SIZE_UNIQUE = 'UNIQUE'
