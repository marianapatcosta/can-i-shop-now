import chromium from '@sparticuz/chromium-min'
import puppeteer from 'puppeteer-core'
import { z } from 'zod'
import {
  FAILED_DB_ACCESS_ERROR,
  FAILED_SCRAPPER_DATA_FETCH_ERROR,
  SIZE_PRIORITY,
  STORE_NOT_SUPPORTED_ERROR,
} from './constants'
import {
  ApiError,
  ConverterOperation,
  PartialProductInfoDB,
  ProductInfo,
  ProductInfoDB,
  ProductUserInfo,
  Store,
} from '@/types'
import { unitToCentConverter } from '@/utils'
import { logger } from './logger'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'

const setDelay = (time: number) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}

export const getDataWithPuppeteer = async (
  url: string,
  waitSelector?: string,
  delay?: number,
  setUserAgent?: boolean
): Promise<string> => {
  const browser = await puppeteer.launch(
    process.env.NODE_ENV === 'production'
      ? {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(
            process.env.CHROMIUM_LINK
          ),
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
        }
      : { executablePath: process.env.LOCAL_CHROME_EXECUTABLE }
  )

  const page = await browser.newPage()
  page.setViewport({ width: 1920, height: 1080 })
  setUserAgent && page.setUserAgent(USER_AGENT)

  await page.goto(url, { waitUntil: 'networkidle0' })
  if (!!waitSelector) {
    await page.waitForSelector(waitSelector)
  }

  if (!!delay) {
    await setDelay(delay)
  }

  const data = await page.content()
  browser.close()
  return data
}

export const failedDataFetchErrorHandler = (
  store: Store,
  url: string,
  error: unknown
): never => {
  if (error instanceof z.ZodError) {
    error = error.issues.map((e) => ({ path: e.path[0], message: e.message }))
  }
  logger.error(FAILED_SCRAPPER_DATA_FETCH_ERROR(store, url, error))
  throw new Error(FAILED_SCRAPPER_DATA_FETCH_ERROR(store, url, error))
}

export const failedDataBaseAccessErrorHandler = (
  dbActionName: string,
  error: unknown
): never => {
  logger.error(FAILED_DB_ACCESS_ERROR(dbActionName, error))
  if (error instanceof ApiError) {
    throw new ApiError(error.message, error.statusCode)
  }
  throw new Error(FAILED_DB_ACCESS_ERROR(dbActionName, error))
}

export const isNumericString = (string: string): boolean =>
  !!string && !isNaN(Number(string))

export const stringFormatter = (string: string | undefined): string =>
  string ? string.replace(/\n+/g, '').trim() : ''

export const priceFormatter = (string: string): number => {
  const price = stringFormatter(string)
    .replace(/[^0-9,._-]+/, '')
    .replace(',', '.')
  return isNumericString(price) ? Number(price) : 0
}

export const getStore = (url: string): Store => {
  if (url.includes('sprintersports')) {
    return Store.SportZone
  }
  const store = Object.values(Store).find((store) =>
    url.includes(store.toLowerCase())
  )
  if (!store) {
    throw new ApiError(STORE_NOT_SUPPORTED_ERROR(url), 400)
  }
  return store
}

export const isUrl = (url: string): boolean => {
  const urlRegex = /^(http|https):\/\//
  return urlRegex.test(url)
}

export const isProductUpdated = (
  updatedProduct: ProductInfo | PartialProductInfoDB | undefined,
  product: ProductInfoDB
) => {
  // if updatedProduct is undefined, then some error occur while scrapping
  if (!updatedProduct) return false
  return (
    updatedProduct.currentPrice !== product.currentPrice ||
    updatedProduct.availableSizes !== product.availableSizes
  )
}

export function orderSizes(sizes: string[]): string[] {
  if (sizes.filter(Boolean).length === 1) return sizes.filter(Boolean)
  const isNumericSize = sizes.every((size) => !!size && !isNaN(Number(size)))
  if (isNumericSize) {
    return sizes
      .map((size) => Number(size))
      .sort((s1, s2) => s1 - s2)
      .map((size) => String(size))
  }
  return sizes
    .map((size) => ({ name: size, value: SIZE_PRIORITY[size] }))
    .sort((s1, s2) => s1.value - s2.value)
    .map((size) => size.name)
}

export const getFormattedPrice = (
  locale: string,
  price: number,
  currency: string
): string => {
  if (!price) return ''
  /*  let lang = url.split('.com/')[1].split('/')[0]

  if (lang.length === 2) {
    lang = `${lang}-${lang.toUpperCase()}`
  } */

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(price)
}

export const formatProduct = (
  product: ProductInfoDB,
  sizesToWatch: string
): ProductUserInfo => {
  return {
    ...product,
    originalPrice: unitToCentConverter(
      product.originalPrice,
      ConverterOperation.ToUnit
    ),
    currentPrice: unitToCentConverter(
      product.currentPrice,
      ConverterOperation.ToUnit
    ),
    sizesToWatch,
  }
}
