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

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { BatchHttpLink } from '@apollo/client/link/batch-http'
import { relayStylePagination } from '@apollo/client/utilities'
import { GRAPHQL_URI } from '../constants'

export function createClient() {
  const link = new BatchHttpLink({
    uri: GRAPHQL_URI,
    batchMax: 5,
    batchInterval: 100,
  })

  const client = new ApolloClient({
    link,
    cache: new InMemoryCache({
      typePolicies: {
        User: {
          fields: {
            objects: relayStylePagination(),
          },
        },
      },
    }),
  })
  return client
}

function createServerSideClient() {
  const link = new HttpLink({
    uri: GRAPHQL_URI,
  })

  const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  })
  return client
}

export const SERVER_SIDE_CLIENT = createServerSideClient()
