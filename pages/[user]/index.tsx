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
import { SERVER_SIDE_CLIENT } from '../../apollo'
import { UserObjectConnection, userObjectConnectionQueryOptions } from '../../apollo/object'
import AppBar from '../../components/AppBar'
import Pagination from '../../components/Pagination'
import { parseSafeIntegerOr } from '../../utils/number'

const first = 20

export default function User({
  offset,
  user,
  objectConnection,
}: {
  offset: number
  user: { id: string; name?: string }
  objectConnection: UserObjectConnection
}) {
  return (
    <>
      <AppBar />

      <_Body>
        <UserCard user={user} />

        {objectConnection.edges.map(edge => (
          <Link passHref key={edge.node.id} href={`/${user.id}/${edge.node.id}`}>
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

        <div>
          <Pagination
            path={`/${user.id}`}
            total={objectConnection.totalCount}
            first={first}
            offset={offset}
          />
        </div>
      </_Body>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext<{ user: string }>) {
  const { user: userId } = context.params!
  const offset = parseSafeIntegerOr(context.query.offset)

  const res = await SERVER_SIDE_CLIENT.query(
    userObjectConnectionQueryOptions({
      variables: {
        userId,
        first,
        offset,
        public: true,
        orderBy: { direction: 'DESC', field: 'UPDATED_AT' },
      },
      fetchPolicy: 'network-only',
    })
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

const _Body = styled.div`
  max-width: 800px;
  margin: 0 auto;
  margin-top: 56px;
`

const _Item = styled.a`
  display: block;
  margin: 8px 0;
  padding: 8px 0;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    opacity: 0.8;
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
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
`

const _Time = styled.div`
  font-size: 12px;
  color: #999999;
`

export function UserCard({ user }: { user: { id: string; name?: string } }) {
  return (
    <_UserCard>
      <_Avatar />

      <_UserName>{user.name?.trim() || user.id}</_UserName>
    </_UserCard>
  )
}

const _UserCard = styled.div`
  padding: 16px 0;
  display: flex;
  align-items: center;
`

const _Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(128, 128, 128, 0.2);
`

const _UserName = styled.div`
  font-size: 16px;
  font-weight: bold;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 16px;
`
