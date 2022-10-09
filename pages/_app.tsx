// Copyright 2022 LiYechao
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ApolloProvider } from '@apollo/client'
import { css, Global } from '@emotion/react'
import { AppProps } from 'next/app'
import { useMemo } from 'react'
import { IntlProvider } from 'react-intl'
import { createClient } from '../apollo'

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

      <IntlProvider locale="en-US">
        <Component {...pageProps} />
      </IntlProvider>
    </ApolloProvider>
  )
}
