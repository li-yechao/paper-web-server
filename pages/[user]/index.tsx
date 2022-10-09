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
import Link from 'next/link'
import { useMemo } from 'react'
import { FormattedTime } from 'react-intl'
import { SERVER_SIDE_CLIENT } from '../../apollo'
import { ObjectConnection, objectConnectionQueryOptions } from '../../apollo/object'

const first = 20

export default function User({
  offset,
  user: { id: userId },
  objectConnection,
}: {
  offset: number
  user: { id: string }
  objectConnection: ObjectConnection
}) {
  return (
    <_Container>
      <_Header>Articles</_Header>

      <div>
        {objectConnection.edges.map(edge => (
          <Link passHref key={edge.node.id} href={`/${userId}/${edge.node.id}`}>
            <_Item>
              <_Title>{edge.node.meta?.title || 'Untitled'}</_Title>
              <_Time>
                <FormattedTime
                  value={Number(edge.node.updatedAt)}
                  year="numeric"
                  month="numeric"
                  day="numeric"
                  hour12={false}
                  hour="numeric"
                  minute="numeric"
                />
              </_Time>
            </_Item>
          </Link>
        ))}
      </div>

      <div>
        <Pagination
          path={`/${userId}`}
          total={objectConnection.totalCount}
          first={first}
          offset={offset}
        />
      </div>
    </_Container>
  )
}

function Pagination({
  path,
  total,
  first,
  offset,
}: {
  path: string
  total: number
  first: number
  offset?: number
}) {
  const { pages, currentPage, totalPage } = useMemo(() => {
    const totalPage = Math.floor(total / first)
    const currentPage = Math.floor((offset || 0) / first)
    const rightPage = Math.min(currentPage + 4, totalPage)
    const leftPage = Math.max(0, rightPage - 10)
    const pages = new Array(rightPage + 1 - leftPage).fill(0).map((_, index) => leftPage + index)
    return { pages, currentPage, totalPage }
  }, [total, first, offset])

  const getHref = (page: number) => (page > 0 ? `${path}?offset=${page * first}` : path)

  return (
    <_Pagination>
      {currentPage > 0 && (
        <Link passHref href={getHref(currentPage - 1)}>
          <_Page>Previous</_Page>
        </Link>
      )}
      {pages.map(page => (
        <Link key={page} passHref href={getHref(page)}>
          <_Page className={currentPage === page ? 'current' : ''}>{page + 1}</_Page>
        </Link>
      ))}
      {currentPage < totalPage && (
        <Link passHref href={getHref(currentPage + 1)}>
          <_Page>Next</_Page>
        </Link>
      )}
    </_Pagination>
  )
}

function correctOffset(offset: any): number {
  offset = Number(offset)
  if (offset && offset > 0 && Number.isSafeInteger(offset)) {
    return offset
  }
  return 0
}

export async function getServerSideProps(context: GetServerSidePropsContext<{ user: string }>) {
  const { user: userId } = context.params!
  const offset = correctOffset(context.query.offset)

  const res = await SERVER_SIDE_CLIENT.query(
    objectConnectionQueryOptions({ variables: { userId, first, offset, public: true } })
  )

  const { user } = res.data
  const objectConnection = user.objects

  return {
    props: {
      offset,
      user,
      objectConnection,
    },
  }
}

const _Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`

const _Header = styled.div`
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid var(--app-bar-color);
  padding: 8px 0;
`

const _Item = styled.a`
  display: block;
  margin: 8px 0;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    opacity: 0.6;
  }

  &:visited {
    color: inherit;
  }

  &:link {
    color: inherit;
  }
`

const _Title = styled.div`
  font-size: 16px;
`

const _Time = styled.div`
  font-size: 12px;
  color: #999999;
`

const _Pagination = styled.div`
  margin: 32px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

const _Page = styled.a`
  margin: 8px;
  text-decoration: none;
  color: #8ab4f8;

  &.current {
    color: currentColor;
  }
`
