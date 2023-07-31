import { Session } from 'next-auth'

export enum HttpStatusCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

export enum HttpRequestMethod {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export interface ProductHistory {
  originalPrice: number
  currentPrice: number
  availableSizes: string
  createdAt: Date
}

export interface ProductInfo {
  id: string
  productId: string
  name: string
  originalPrice: number
  currentPrice: number
  currency: string
  allSizes: string
  availableSizes: string
  photoUrl: string
  productHistory?: ProductHistory[]
}

export interface ProductUserInfo extends ProductInfo {
  sizesToWatch: string
  url: string
  store: string
}

export type PartialProductInfoDB = Pick<
  ProductInfoDB,
  'originalPrice' | 'currentPrice' | 'availableSizes'
>

export type ProductInfoDB = Omit<ProductInfo, 'allSizes' | 'availableSizes'> & {
  allSizes: string
  availableSizes: string
  store: Store
  url: string
  productUser?: { sizesToWatch: string }[]
}

export enum Store {
  Bershka = 'Bershka',
  Decathlon = 'Decathlon',
  Fifty = 'Fifty',
  Lefties = 'Lefties',
  MangoOutlet = 'MangoOutlet',
  Mango = 'Mango',
  Parfois = 'Parfois',
  //PullAndBear = 'PullAndBear',
  Springfield = 'Springfield',
  SportZone = 'SportZone',
  Stradivarius = 'Stradivarius',
  WomenSecret = 'WomenSecret',
  Zara = 'Zara',
}

export enum ConverterOperation {
  ToUnit = 'ToUnit',
  ToCents = 'ToCents',
}

export class ApiError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

export type ProductUser = {
  id: string
  product: {
    id: string
    name: string
    url: string
    store: string
    photoUrl: string
    availableSizes: string
    currentPrice: number
    currency: string
  }
  user: {
    id: string
    email: string
  }
}

export type SendEmailUser = {
  id: string
  email: string
  products: {
    id: string
    name: string
    photoUrl: string
    availableSizes: string
    currentPrice: string
    currency: string
  }[]
}

export const enum Locale {
  EN = 'en',
  PT = 'pt',
}

export const enum ModalType {
  CONFIRMATION = 'confirmation',
  EDIT = 'edit',
}

export interface User {
  id: string
  name: string
  email: string
  emailVerified: string
  image: string
  city: string
  zipCode: string
  createdAt: Date
  updatedAt: Date
}

export interface MySession extends Session {
  user: User
}

export enum SortBy {
  Updated_AT = 'updatedAt',
  Name = 'name',
  Store = 'store',
}

export enum OrderBy {
  ASC = 'asc',
  DESC = 'desc',
}

export type Sort = {
  [key in SortBy]: OrderBy
}

export enum ToastType {
  ALERT = 'alert',
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
}

export type ToastData = { message: string; type: ToastType | undefined }
