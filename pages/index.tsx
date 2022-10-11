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
import { FormattedTime } from 'react-intl'
import { SERVER_SIDE_CLIENT } from '../apollo'
import { ObjectConnection, objectConnectionQueryOptions } from '../apollo/object'
import AppBar from '../components/AppBar'
import Pagination from '../components/Pagination'
import { parseSafeIntegerOr } from '../utils/number'

const first = 20

export default function Home({
  offset,
  objectConnection,
}: {
  offset: number
  objectConnection: ObjectConnection
}) {
  return (
    <>
      <AppBar />

      <Body>
        {objectConnection.nodes.map(node => (
          <_Item key={node.id}>
            <Link passHref href={`/${node.user.id}`}>
              <_UserLink>{node.user.name?.trim() || node.user.id}</_UserLink>
            </Link>

            <Link passHref href={`/${node.user.id}/${node.id}`}>
              <_ItemLink>
                <_Title>{node.meta?.title || 'Untitled'}</_Title>

                <_Time>
                  <FormattedTime
                    value={Number(node.updatedAt)}
                    year="numeric"
                    month="numeric"
                    day="numeric"
                    hour12={false}
                    hour="numeric"
                    minute="numeric"
                  />
                </_Time>
              </_ItemLink>
            </Link>
          </_Item>
        ))}

        <div>
          <Pagination
            path={`/`}
            total={objectConnection.totalCount}
            first={first}
            offset={offset}
          />
        </div>
      </Body>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const offset = parseSafeIntegerOr(context.query.offset)

  const res = await SERVER_SIDE_CLIENT.query(
    objectConnectionQueryOptions({
      variables: { first, offset, orderBy: { field: 'UPDATED_AT', direction: 'DESC' } },
      fetchPolicy: 'network-only',
    })
  )

  const objectConnection = res.data.objects

  return {
    props: {
      offset,
      objectConnection,
    },
  }
}

const Body = styled.div`
  max-width: 800px;
  margin: 0 auto;
  margin-top: 56px;
`

const _Item = styled.div`
  margin: 8px 0;
  padding: 8px 0;

  &:hover {
    opacity: 0.8;
  }

  a {
    cursor: pointer;
    text-decoration: none;
  }

  a:visited {
    color: inherit;
  }

  a:link {
    color: inherit;
  }
`

const _UserLink = styled.a`
  font-size: 12px;
  opacity: 0.6;
  color: inherit;
  display: inline-block;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    text-decoration: underline;
    opacity: 1;
  }
`

const _ItemLink = styled.a`
  display: block;
`

const _Title = styled.div`
  font-size: 16px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
`

const _Time = styled.div`
  font-size: 12px;
  color: #999999;
`
