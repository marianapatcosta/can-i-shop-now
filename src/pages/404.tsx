import { useEffect } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

const FourOhFour = () => {
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    router.replace('/')
  }, [router])

  return (
    <>
      <h2 className='text-center mt-64'>{t('pageNotFound')}</h2>
    </>
  )
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default FourOhFour
