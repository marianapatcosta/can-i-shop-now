import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { signIn } from 'next-auth/react'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import { Button } from '@/components'
import styles from '@/styles/login.module.css'

export default function Login() {
  const { t } = useTranslation(['login'])

  return (
    <>
      <Head>
        <title>{t('login')}</title>
      </Head>
      <>
        <h1>{t('login')}</h1>
        <div className='mt-12 mx-auto w-max'>
          <p className='mb-3 text-center'>{t('loginWithGoogle')}</p>
          <div className={styles['login__button']}>
            <Button
              icon={faGoogle}
              label={t('login') as string}
              additionalClass='mx-auto'
              onClick={() =>
                signIn('google', { redirect: true, callbackUrl: '/' })
              }
            />
          </div>
        </div>
      </>
    </>
  )
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['login'])),
    },
  }
}
