import React, { useCallback, useMemo, useRef, useState } from 'react'
import Head from 'next/head'
import { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import axios from 'axios'
import {
  faArrowDownAZ,
  faArrowUpAZ,
  faPlus,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useInfiniteQuery } from 'react-query'
import { Button, Product, Select } from '@/components'
import { useModal } from '@/hooks/useModal'
import { MySession, ProductUserInfo, OrderBy, Store, Sort } from '@/types'
import { getProductsByUser } from '@/api-utils/repositories/products/getProductsByUser'
import { authOptions } from './api/auth/[...nextauth]'
import styles from '@/styles/products.module.css'

const sortsBy = [
  { label: 'updatedAt', value: 'updatedAt' },
  { label: 'name', value: 'name' },
  { label: 'store', value: 'store' },
]
const LIMIT = 10

export default function Products(props: {
  products: { products: ProductUserInfo[]; count: number }
}) {
  const router = useRouter()

  const { t } = useTranslation(['products', 'common'])
  const { onDeleteProduct, onEditProduct, Modal } = useModal()
  const sortByOptions = useMemo(
    () =>
      sortsBy.map((sortBy) => ({
        label: (
          <p className='w-full h-full px-2 py-1 block text-start'>
            {t(sortBy.label)}
          </p>
        ),
        value: sortBy.value,
      })),
    [t]
  )
  const observer = useRef<IntersectionObserver | null>(null)
  const [sortBy, setSortBy] = useState(sortByOptions[0])
  const [orderBy, setOrderBy] = useState(OrderBy.DESC)

  const handleSortByChange = useCallback(
    (option: { label: JSX.Element; value: string }) => {
      setSortBy(option)
    },
    []
  )

  const toggleOrderBy = useCallback(() => {
    setOrderBy((prevOrderBy) =>
      prevOrderBy === OrderBy.ASC ? OrderBy.DESC : OrderBy.ASC
    )
  }, [])

  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery<{
    products: ProductUserInfo[]
    count: number
  }>(
    ['products', orderBy, sortBy.value],
    async ({ pageParam = 1 }) => {
      const offset = (pageParam - 1) * LIMIT
      const { data } = await axios.get(
        `/api/products?sortBy=${sortBy.value}&orderBy=${orderBy}&offset=${offset}&limit=${LIMIT}`
      )
      return data
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        return !lastPage || lastPage.count <= allPages.length * LIMIT
          ? undefined
          : allPages.length + 1
      },
      initialData: () => ({ pageParams: [undefined], pages: [props.products] }),
    }
  )

  const loadMoreRef = useCallback(
    (element: Element) => {
      if (isLoading) {
        return
      }

      if (observer.current) {
        observer.current.disconnect()
      }
      observer.current = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })
      if (element) {
        observer.current.observe(element)
        return observer
      }
    },
    [isLoading, fetchNextPage, hasNextPage]
  )

  return (
    <>
      <Head>
        <title>{t('yourProducts')}</title>
        <meta name='description' content='List of products' />
      </Head>
      <>
        <h1>{t('yourProducts')}</h1>
        {!!data?.pages[0].count && (
          <div className={styles['products__toolbar']}>
            <Select
              selectedOption={sortBy}
              placeholder={t('selectSortBy')}
              selectOption={handleSortByChange}
              options={sortByOptions}
              optionsHeight='6.5rem'
              additionalClass='max-w-[20rem] w-44'
            />
            <Button
              icon={orderBy === 'asc' ? faArrowDownAZ : faArrowUpAZ}
              iconSize='lg'
              buttonType='secondary'
              aria-label={
                t(
                  orderBy === 'asc' ? 'descOrderLabel' : 'ascOrderLabel'
                ) as string
              }
              title={t(orderBy === 'asc' ? 'ascOrder' : 'descOrder') as string}
              additionalClass='w-8 h-8'
              onClick={toggleOrderBy}
            />
          </div>
        )}
        {!data?.pages[0].count ? (
          <div className={styles['products__no-products']}>
            <p>{t('noProducts')}</p>
            <Button
              icon={faPlus}
              label={t('addOne') as string}
              onClick={() => router.push('/new')}
            />
          </div>
        ) : (
          <>
            <ul className={styles.products}>
              {data?.pages?.map(({ products }) =>
                products.map((product: ProductUserInfo) => (
                  <Product
                    key={product.id}
                    id={product.id}
                    productId={product.productId}
                    url={product.url}
                    name={product.name}
                    store={product.store as Store}
                    photoUrl={product.photoUrl}
                    originalPrice={product.originalPrice}
                    currency={product.currency}
                    currentPrice={product.currentPrice}
                    availableSizes={product.availableSizes}
                    allSizes={product.allSizes}
                    sizesToWatch={product.sizesToWatch}
                    onDeleteProduct={() =>
                      onDeleteProduct({
                        id: product.id,
                        name: product.name,
                        sizesToWatch: product.sizesToWatch,
                      })
                    }
                    onEditProduct={() =>
                      onEditProduct({
                        id: product.id,
                        name: product.name,
                        sizesToWatch: product.sizesToWatch,
                      })
                    }
                  />
                ))
              )}
              <li>
                {/*// @ts-ignore */}
                <div ref={loadMoreRef} className='text-center'>
                  {isLoading && (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      size='lg'
                      className='text-highlight animate-spin'
                    />
                  )}
                </div>
              </li>
            </ul>

            <Button
              buttonType='action'
              icon={faPlus}
              iconSize='lg'
              type='button'
              additionalClass={`${styles['products__add-product']}`}
              onClick={() => router.push('/new')}
            />
          </>
        )}
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
    'products',
    'common',
  ])

  const products = await getProductsByUser(
    session.user?.id,
    {
      updatedAt: OrderBy.DESC,
    } as Sort,
    0,
    LIMIT
  )

  return {
    props: {
      ...locales,
      session,
      products,
    },
  }
}
