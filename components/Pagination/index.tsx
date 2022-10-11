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
import Link from 'next/link'
import { useMemo } from 'react'

export default function Pagination({
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
