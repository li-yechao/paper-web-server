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

import {
  gql,
  LazyQueryHookOptions,
  MutationHookOptions,
  QueryHookOptions,
  useLazyQuery,
  useMutation,
  useQuery,
} from '@apollo/client'

const OBJECT_QUERY = gql`
  query Object($userId: String!, $objectId: String!) {
    user(userId: $userId) {
      id

      object(objectId: $objectId) {
        id
        userId
        createdAt
        updatedAt
        meta
        data
      }
    }
  }
`

export const useObject = (
  options?: QueryHookOptions<
    {
      user: {
        id: string

        object: {
          id: string
          userId: string
          createdAt: string
          updatedAt: string
          meta?: { title?: string }
          data?: string
        }
      }
    },
    { userId: string; objectId: string }
  >
) => {
  return useQuery(OBJECT_QUERY, options)
}

const CREATE_OBJECT_MUTATION = gql`
  mutation CreateObject($parentId: String, $input: CreateObjectInput!) {
    createObject(parentId: $parentId, input: $input) {
      id
      userId
    }
  }
`

export const useCreateObject = (
  options?: MutationHookOptions<
    {
      createObject: {
        id: string
      }
    },
    {
      parentId?: string
      input: {
        meta?: { type: string }
        data?: string
        encoding?: 'BASE64'
      }
    }
  >
) => {
  return useMutation(CREATE_OBJECT_MUTATION, options)
}

const UPDATE_OBJECT_MUTATION = gql`
  mutation UpdateObject($objectId: String!, $input: UpdateObjectInput!) {
    updateObject(objectId: $objectId, input: $input) {
      id
      createdAt
      updatedAt
      meta
      data
    }
  }
`

export const useUpdateObject = (
  options?: MutationHookOptions<
    {
      updateObject: {
        id: string
        createdAt: string
        updatedAt: string
        meta?: { title?: string }
        data?: string
      }
    },
    {
      objectId: string
      input: {
        meta?: { title?: string }
        data?: string
      }
    }
  >
) => {
  return useMutation(UPDATE_OBJECT_MUTATION, options)
}

const OBJECT_URI_QUERY = gql`
  query ObjectUri($userId: String!, $objectId: String!) {
    user(userId: $userId) {
      id

      object(objectId: $objectId) {
        id
        uri
      }
    }
  }
`

export const useObjectUriQuery = (
  options?: LazyQueryHookOptions<
    {
      user: {
        id: string

        object: {
          id: string
          uri?: string
        }
      }
    },
    { userId: string; objectId: string }
  >
) => {
  return useLazyQuery(OBJECT_URI_QUERY, options)
}
