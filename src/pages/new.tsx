import { FormEvent, useState } from 'react'
import { getServerSession } from 'next-auth'
import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { useMutation } from 'react-query'
import { BackLink, Button, Input } from '@/components'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { useStore } from '@/store'
import { MySession, Store, ToastType } from '@/types'
import { authOptions } from './api/auth/[...nextauth]'
import { getErrorTranslationKey, pascalCaseToSentenceCase } from '@/utils'
import styles from '@/styles/new.module.css'

export default function NewProduct() {
  const { t } = useTranslation(['new', 'common'])
  const addToast = useStore((state) => state.addToast)

  const [url, setUrl] = useState('')
  const [sizesToWatch, setSizesToWatch] = useState('')

  const { mutate: createProduct, isLoading: isCreating } = useMutation({
    mutationFn: (productData: { url: string; sizesToWatch: string }) => {
      return axios.post(`/api/product/new`, productData)
    },
    onError: (error, variables, context) => {
      const translation = getErrorTranslationKey(
        ((error as AxiosError)?.response as AxiosResponse).data.message
      )
      addToast({
        type: ToastType.ALERT,
        message: t(translation.key, { ...translation.variables }),
      })
    },
    onSuccess: (data, variables, context) => {
      addToast({ type: ToastType.SUCCESS, message: 'productCreateSuccess' })
      setUrl('')
      setSizesToWatch('')
    },
  })

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const urlRegex = /^(http|https):\/\/[^ "]+$/
    const sizesRegex = /^[A-Za-z0-9,]*$/
    if (!urlRegex.test(url) || !sizesRegex.test(sizesToWatch)) {
      return
    }
    createProduct({ url: url.trim(), sizesToWatch: sizesToWatch.trim() })
  }

  const tooltipContent = `
    ${t('storesSupported')}
    ${Object.values(Store)
      .map(
        (store, index) =>
          `${index === 0 ? '' : '\n'} - ${pascalCaseToSentenceCase(store)};`
      )
      .join('')}
  `

  return (
    <>
      <Head>
        <title>{t('addNew')}</title>
      </Head>
      <>
        <div className='relative'>
          <BackLink label={t('common:back') as string} />
          <h1>{t('addNew')}</h1>
        </div>
        <div className='mt-12 mx-auto'>
          <form className={styles['new-product__form']} onSubmit={saveProduct}>
            <div>
              <Input
                required
                autoComplete='off'
                label={t('url') as string}
                placeholder={t('enterUrl') as string}
                title={t('enterUrl') as string}
                value={url}
                pattern='^(http|https):\/\/[^ "]+$'
                tooltipContent={tooltipContent}
                onChange={(event) =>
                  setUrl((event.target as HTMLInputElement).value)
                }
              />
              <Input
                required
                autoComplete='off'
                label={t('sizesToWatch') as string}
                placeholder={t('enterSizesToWatch') as string}
                title={t('enterSizesToWatch') as string}
                value={sizesToWatch}
                pattern='^[A-Za-z0-9,]*$'
                onChange={(event) =>
                  setSizesToWatch((event.target as HTMLInputElement).value)
                }
              />
            </div>
            <Button
              disabled={!sizesToWatch || !url}
              icon={faSave}
              label={t('save') as string}
              loading={isCreating}
            />
          </form>
        </div>
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
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? 'en', [
        'common',
        'new',
      ])),
    },
  }
}
