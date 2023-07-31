import { useMemo, MouseEvent, useCallback } from 'react'
import { useTranslation } from 'next-i18next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBinoculars,
  faCircleCheck,
  faPencil,
  faShoppingCart,
  faTriangleExclamation,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { BackLink } from '@/components/back-link'
import { Button } from '@/components/button'
import { useModal } from '@/hooks/useModal'
import { ApiError, MySession, ProductUserInfo, ToastType } from '@/types'
import { getFormattedProduct, pascalCaseToSentenceCase } from '@/utils'
import { authOptions } from '../api/auth/[...nextauth]'
import { getProduct } from '@/api-utils/repositories/products/getProductUser'
import { useStore } from '@/store'
import styles from '@/styles/product.module.css'

const fetchProduct = async (productId: string) => {
  const { data } = await axios.get(`/api/product/${productId}`)
  return data.product
}

export default function ProductDetails() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { productId } = router.query
  const addToast = useStore((state) => state.addToast)
  const { t } = useTranslation(['product', 'common'])
  const { onDeleteProduct, onEditProduct, Modal } = useModal(
    () => queryClient.invalidateQueries(['product']),
    useCallback(() => router.push('/'), [router])
  )
  const { data: product } = useQuery<ProductUserInfo>({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId as string),
    onError: () => {
      addToast({ type: ToastType.ALERT, message: 'productNotFound' })
      router.push('/')
    },
  })

  const {
    id,
    store,
    name,
    url,
    originalPrice,
    currentPrice,
    currency,
    allSizes,
    availableSizes,
    photoUrl,
    sizesToWatch,
  } = product!

  const {
    sizesToWatchArray,
    formattedCurrentPrice,
    formattedOriginalPrice,
    sizes,
    displaySize,
  } = useMemo(
    () =>
      getFormattedProduct(
        availableSizes,
        allSizes,
        sizesToWatch,
        currentPrice,
        originalPrice,
        currency,
        router.locale || 'en-EN'
      ),
    [
      availableSizes,
      allSizes,
      sizesToWatch,
      currentPrice,
      originalPrice,
      currency,
      router.locale,
    ]
  )

  const deleteProduct = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onDeleteProduct({
      id,
      name,
      sizesToWatch: sizesToWatch,
    })
  }

  const editProduct = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onEditProduct({
      id,
      name,
      sizesToWatch: sizesToWatch,
    })
  }

  return (
    <>
      <Head>
        <title>{name}</title>
        <meta name='description' content={name} />
      </Head>
      <>
        <div className='relative'>
          <BackLink label={t('common:back') as string} />
          <h1 className={styles.name}>{name}</h1>
        </div>
        <p className={styles.store}>{pascalCaseToSentenceCase(store)}</p>
        {!availableSizes && (
          <p className={styles['product-not-available']}>
            {t('productNotAvailable')}
          </p>
        )}
        <div className='flex gap-3 p-2'>
          <div className={styles.image}>
            <Image
              className='rounded-md object-cover object-center'
              src={photoUrl}
              alt={name}
              fill
            />
          </div>

          <div className='flex flex-col w-full gap-4'>
            <div className='flex justify-end'>
              <div className='flex gap-2 justify-right w-full sm:w-auto'>
                <Button
                  label={t('edit') as string}
                  icon={faPencil}
                  iconSize='sm'
                  additionalClass='flex-1 sm:w-20'
                  onClick={editProduct}
                />
                <Button
                  label={t('delete') as string}
                  icon={faTrash}
                  iconSize='sm'
                  additionalClass='flex-1 sm:w-20'
                  onClick={deleteProduct}
                />
              </div>
            </div>
            <div className={styles['product-content']}>
              <div className='flex flex-col justify-center'>
                <p
                  className={`${styles['current-price']} ${
                    !!originalPrice ? styles['current-price--highlighted'] : ''
                  }`}
                >
                  <data className='money' value={currentPrice}>
                    {formattedCurrentPrice}
                  </data>
                </p>
                {!!originalPrice && (
                  <p className={styles['original-price']}>
                    <data className='money' value={originalPrice}>
                      {formattedOriginalPrice}
                    </data>
                  </p>
                )}
              </div>
              {!sizes.length ? (
                <p>
                  <FontAwesomeIcon
                    icon={faTriangleExclamation}
                    className='text-highlight mr-1'
                  />
                  {t('productNotAvailable')}
                </p>
              ) : (
                <div className='mb-2'>
                  <p className='flex items-center mb-2'>
                    {t('availableSizes')}
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      size='sm'
                      className='text-green-600 ml-2'
                    />
                  </p>
                  <ul className={styles.sizes}>
                    {sizes.map(({ size, isAvailable }) => (
                      <li
                        key={`${productId}-size-${size}`}
                        className={`${styles.size} ${
                          !isAvailable ? styles['size-not-available'] : ''
                        }`}
                      >
                        {t(displaySize(size))}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className='mb-2 flex gap-3'>
                <div>
                  <p className='flex items-center mb-2'>
                    {t('sizesToWatch')}
                    <FontAwesomeIcon
                      icon={faBinoculars}
                      size='sm'
                      className='text-highlight ml-2'
                    />
                  </p>
                  <ul className={styles.sizes}>
                    {sizesToWatchArray.map((size) => (
                      <li
                        key={`${productId}-watch-size-${size}`}
                        className={styles.size}
                      >
                        {t(displaySize(size))}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <a
              className={styles.link}
              href={url}
              target='_blank'
              rel='nofollow noopener noreferrer'
            >
              {t('goToShop')}
              <FontAwesomeIcon
                size='sm'
                icon={faShoppingCart}
                className='text-highlight ml-2'
              />
            </a>
          </div>
        </div>
        <div className='my-4'>
          <h2>{t('productHistory')}</h2>

          <div className={styles['product-graphic']}>
            <h3>{t('price')}</h3>
          </div>
          <div className={styles['product-graphic']}>
            <h3>{t('sizesAvailability')}</h3>
          </div>
        </div>
        <Modal />
      </>
    </>
  )
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session: MySession | null = await getServerSession(
    context.req,
    context.res,
    authOptions
  )

  if (!session?.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }
  const locales = await serverSideTranslations(context.locale || 'en', [
    'product',
    'common',
  ])
  const productId = context.params?.productId as string
  const queryClient = new QueryClient()
  try {
    await queryClient.fetchQuery(['product', productId], () =>
      getProduct(session.user.id, productId)
    )
  } catch (error) {
    if ((error as ApiError).statusCode === 404) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }
  }

  return {
    props: {
      ...locales,
      session,
      dehydratedState: dehydrate(queryClient),
    },
  }
}
