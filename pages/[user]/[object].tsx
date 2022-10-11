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

import styled from '@emotion/styled'
import { GetServerSidePropsContext } from 'next'
import { useMemo } from 'react'
import { toString } from 'uint8arrays'
import { SERVER_SIDE_CLIENT } from '../../apollo'
import {
  Object_,
  objectQueryOptions,
  useCreateObject,
  useObjectUriQuery,
} from '../../apollo/object'
import AppBar from '../../components/AppBar'
import LexicalEditor from '../../components/LexicalEditor'
import { ImageNode } from '../../components/LexicalEditor/nodes/ImageNode'
import { UserCard } from './'

export default function Object({
  user,
  object,
}: {
  user: { id: string; name?: string }
  object: Object_
}) {
  const [createObject] = useCreateObject()
  const [queryObjectUri] = useObjectUriQuery()

  const imageProviderValue = useMemo(
    () => ({
      upload: async (file: File) => {
        const data = toString(new Uint8Array(await file.arrayBuffer()), 'base64')
        const res = await createObject({
          variables: {
            parentId: object.id,
            input: {
              meta: { type: 'image' },
              data,
              encoding: 'BASE64',
            },
          },
        })
        if (res.errors || !res.data) {
          throw new Error(res.errors?.[0]?.message || 'upload file failed')
        }
        return res.data.createObject.id
      },
      source: async (src?: string | null) => {
        if (!src) {
          return null
        }

        const res = await queryObjectUri({
          variables: { userId: object.userId, objectId: src },
        })
        if (!res.data || res.error) {
          throw res.error || new Error('query object cid failed')
        }
        const uri = res.data.user.object.uri
        if (!uri) {
          throw new Error('object cid not found')
        }
        return uri
      },
      thumbnail: { maxSize: 1024 },
    }),
    [createObject, queryObjectUri]
  )

  return (
    <>
      <AppBar />

      <_Container>
        <UserCard user={user} />

        <_Article>
          <ImageNode.Provider value={imageProviderValue}>
            <LexicalEditor defaultValue={object.data} />
          </ImageNode.Provider>
        </_Article>
      </_Container>
    </>
  )
}

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ user: string; object: string }>
) {
  const { user: userId, object: objectId } = context.params!

  const res = await SERVER_SIDE_CLIENT.query(
    objectQueryOptions({ variables: { userId, objectId }, fetchPolicy: 'network-only' })
  )

  const { user } = res.data
  const { object } = user

  return {
    props: {
      user,
      object,
    },
  }
}

const _Container = styled.div`
  margin: 0 auto;
  max-width: 800px;
  margin-top: 56px;
`

const _Article = styled.div``
