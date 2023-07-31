import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <meta
          name='description'
          content='Web application that allows you to track the prices and sizes availability of products sold by some online stores'
        />

        <link rel='icon' href='/favicon.ico' />
        <Script src='/theme.js' strategy='beforeInteractive' />
      </Head>
      <body>
        <Main />
        <div id='modal' />
        <NextScript />
      </body>
    </Html>
  )
}
