import { SIZE_UNIQUE } from '@/api-utils/constants'
import { ConverterOperation } from '@/types'

export const unitToCentConverter = (
  price: number,
  operation: ConverterOperation = ConverterOperation.ToCents
): number => {
  const converterFactor = 100
  return operation === ConverterOperation.ToUnit
    ? price / converterFactor
    : Math.round(price * converterFactor)
}

export const getFormattedPrice = (
  locale: string,
  price: number,
  currency: string
): string | undefined => {
  if (!price) return undefined

  if (!currency) return String(price)

  const priceInUnits = unitToCentConverter(price, ConverterOperation.ToUnit)
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(priceInUnits)
}

export const pascalCaseToSentenceCase = (pascalCaseString: string): string => {
  if (!pascalCaseString) return ''
  const result = pascalCaseString.replace(/([A-Z])/g, ' $1').trim()
  return `${result[0].toUpperCase()}${result.substring(1).toLowerCase()}`
}

export const isTouchDevice = (): boolean =>
  'ontouchstart' in window || !!navigator.maxTouchPoints

export const getFormattedProduct = (
  availableSizes: string,
  allSizes: string,
  sizesToWatch: string,
  currentPrice: number,
  originalPrice: number,
  currency: string,
  locale: string
): {
  sizesToWatchArray: string[]
  formattedCurrentPrice: string | undefined
  formattedOriginalPrice: string | undefined
  sizes: { size: string; isAvailable: boolean }[]
  displaySize: (size: string) => string
} => {
  const availableSizesArray = !!availableSizes ? availableSizes.split(',') : []
  const allSizesArray = !!allSizes ? allSizes.split(',') : []
  const sizesToWatchArray = !!sizesToWatch ? sizesToWatch.split(',') : []

  const formattedCurrentPrice = getFormattedPrice(
    locale,
    currentPrice,
    currency
  )

  const formattedOriginalPrice = getFormattedPrice(
    locale,
    originalPrice,
    currency
  )

  const sizes = !availableSizesArray.length
    ? []
    : allSizesArray.map((size) => ({
        size,
        isAvailable: availableSizesArray.includes(size),
      }))

  const displaySize = (size: string): string =>
    size === SIZE_UNIQUE ? 'unique' : size

  return {
    sizesToWatchArray,
    formattedCurrentPrice,
    formattedOriginalPrice,
    sizes,
    displaySize,
  }
}

export const getErrorTranslationKey = (
  errorMessage: string
): { key: string; variables?: { [key: string]: string } } => {
  const message = errorMessage.toLowerCase()

  if (message.includes('size(s)') && message.includes('not available')) {
    return {
      key: 'sizesNotAvailable',
      variables: {
        sizes: message.split('size(s)')[1].split('not available')[0],
      },
    }
  }

  if (message.includes('product not found')) {
    return {
      key: 'productNotExist',
    }
  }

  if (message.includes('already watching the product')) {
    return {
      key: 'productAlreadyWatched',
    }
  }

  if (message.includes('store not supported')) {
    return {
      key: 'storeNotSupported',
    }
  }

  return { key: 'generalError' }
}
