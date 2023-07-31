import { useEffect, useState } from 'react'
import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { appWithTranslation } from 'next-i18next'
import { SessionProvider } from 'next-auth/react'
import Head from 'next/head'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { QueryClient, QueryClientProvider, Hydrate } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { config } from '@fortawesome/fontawesome-svg-core'
import { Layout } from '@/components'
import { COLLECTION_LOCALE } from '@/constants'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useStore } from '@/store'
import '@/styles/globals.css'

// Tell Font Awesome to skip adding the CSS automatically
// since it's already imported above
config.autoAddCss = false

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()
  const { getStoredItem } = useLocalStorage()
  const updateSettings = useStore((state) => state.updateSettings)

  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    const locale =
      getStoredItem<string>(COLLECTION_LOCALE) || window.navigator.language
    if (locale) {
      router.locale = locale

      locale !== router.defaultLocale &&
        router.push(`/${locale}${router.pathname}`)
    }
  }, [])

  return (
    <SessionProvider session={pageProps.session}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <Layout>
            <Head>
              <meta
                name='viewport'
                content='width=device-width, initial-scale=1'
              />
            </Head>
            <Component {...pageProps} />
          </Layout>
          <ReactQueryDevtools initialIsOpen={false} />
        </Hydrate>
      </QueryClientProvider>
    </SessionProvider>
  )
}

export default appWithTranslation(App)
