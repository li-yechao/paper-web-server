import { ApolloProvider } from '@apollo/client'
import { css, Global } from '@emotion/react'
import { createClient } from 'apollo'
import { AppProps } from 'next/app'
import { useMemo } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const apolloClient = useMemo(() => createClient(), [])

  return (
    <ApolloProvider client={apolloClient}>
      <Global
        styles={css`
          html {
            --background-color: #ffffff;
            --app-bar-color: #f2f2f7;
            --color: #000000;

            @media (prefers-color-scheme: dark) {
              --background-color: #000000;
              --app-bar-color: #1c1c1e;
              --color: #ffffff;
            }
          }

          body {
            margin: 0;
            background-color: var(--background-color);
            color: var(--color);
            font-family: -apple-system, system-ui, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans,
              sans-serif, BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB,
              Microsoft YaHei, Arial;
            font-size: 15px;
            line-height: 1.6;
          }
        `}
      />

      <Component {...pageProps} />
    </ApolloProvider>
  )
}
