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

import { css } from '@emotion/css'
import styled from '@emotion/styled'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { EditorThemeClasses } from 'lexical'
import { GetServerSidePropsContext } from 'next'
import { ComponentProps, useMemo } from 'react'
import { toString } from 'uint8arrays'
import { UserCard } from '.'
import { SERVER_SIDE_CLIENT } from '../../apollo'
import {
  Object_,
  objectQueryOptions,
  useCreateObject,
  useObjectUriQuery,
} from '../../apollo/object'
import AppBar from '../../components/AppBar'
import { ImageNode } from '../../components/lexical/nodes/ImageNode'

export default function Object({
  user,
  object,
}: {
  user: { id: string; name?: string }
  object: Object_
}) {
  const initialConfig = useMemo<ComponentProps<typeof LexicalComposer>['initialConfig']>(
    () => ({
      namespace: 'editor',
      editable: false,
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        LinkNode,
        AutoLinkNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableRowNode,
        TableCellNode,
        ImageNode,
      ],
      theme,
      onError: e => {
        throw e
      },
      editorState: object.data,
    }),
    []
  )

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
            <LexicalComposer initialConfig={initialConfig}>
              <RichTextPlugin
                contentEditable={<ContentEditable testid="lexical-editor" />}
                placeholder={<div />}
              />
            </LexicalComposer>
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

const theme: EditorThemeClasses = {
  text: {
    bold: css`
      font-weight: bold;
    `,
    italic: css`
      font-style: italic;
    `,
    strikethrough: css`
      text-decoration: line-through;
    `,
    underline: css`
      text-decoration: underline;
    `,
    underlineStrikethrough: css`
      text-decoration: line-through underline;
    `,
    code: css`
      background-color: rgb(240, 242, 245);
      padding: 1px 0.25rem;
      font-family: Menlo, Consolas, Monaco, monospace;
      font-size: 94%;
    `,
  },
  paragraph: css`
    margin: 0 0 8px;
    text-align: justify;
    white-space: normal;

    &:last-child {
      margin-bottom: 0;
    }
  `,
  quote: css`
    margin: 5px 0;
    padding-left: 1em;
    border-left: 3px solid #eee;
    color: #8c8c8c;
  `,
  heading: {
    h1: css`
      font-size: 28px;
      font-weight: 800;
      margin: 26px 0 10px 0;
    `,
    h2: css`
      font-size: 24px;
      font-weight: 700;
      margin: 21px 0 5px 0;
    `,
    h3: css`
      font-size: 20px;
      margin: 16px 0 5px 0;
    `,
    h4: css`
      font-size: 16px;
      margin: 10px 0 5px 0;
    `,
    h5: css`
      font-size: 15px;
      margin: 8px 0 5px 0;
    `,
  },
  link: css`
    color: rgb(33, 111, 219);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  `,
  list: {
    listitem: css`
      margin-left: 32px;
    `,
    listitemChecked: css`
      position: relative;
      margin-left: 8px;
      margin-right: 8px;
      padding-left: 24px;
      padding-right: 24px;
      list-style-type: none;
      outline: none;

      &:before {
        content: '';
        width: 16px;
        height: 16px;
        top: 2px;
        left: 0;
        cursor: pointer;
        display: block;
        background-size: cover;
        position: absolute;

        border: 1px solid rgb(61, 135, 245);
        border-radius: 2px;
        background-color: #3d87f5;
        background-repeat: no-repeat;
      }

      &:after {
        content: '';
        cursor: pointer;
        border-color: #fff;
        border-style: solid;
        position: absolute;
        display: block;
        top: 5px;
        width: 4px;
        left: 6px;
        height: 8px;
        transform: rotate(45deg);
        border-width: 0 2px 2px 0;
      }

      &:focus:before {
        box-shadow: 0 0 0 2px #a6cdfe;
        border-radius: 2px;
      }
    `,
    listitemUnchecked: css`
      position: relative;
      margin-left: 8px;
      margin-right: 8px;
      padding-left: 24px;
      padding-right: 24px;
      list-style-type: none;
      outline: none;

      &:before {
        content: '';
        width: 16px;
        height: 16px;
        top: 2px;
        left: 0;
        cursor: pointer;
        display: block;
        background-size: cover;
        position: absolute;

        border: 1px solid #999;
        border-radius: 2px;
      }

      &:focus:before {
        box-shadow: 0 0 0 2px #a6cdfe;
        border-radius: 2px;
      }
    `,
    ol: css`
      margin: 8px 0 5px 0;
      padding: 0;
    `,
    ul: css`
      margin: 8px 0 5px 0;
      padding: 0;
    `,
  },
  table: css`
    border-collapse: collapse;
    border-spacing: 0;
    max-width: 100%;
    overflow-y: scroll;
    table-layout: fixed;
    width: 100%;
  `,
  tableCell: css`
    border: 1px solid black;
    padding: 6px 8px;
    min-width: 75px;
    vertical-align: top;
    text-align: start;

    @media (prefers-color-scheme: dark) {
      border-color: #9aa0a6;
    }
  `,
  tableCellHeader: css`
    background-color: #f2f3f5;
    text-align: start;

    @media (prefers-color-scheme: dark) {
      background: rgba(232, 234, 237, 0.08);
    }
  `,
  code: css`
    background-color: rgb(240, 242, 245);
    font-family: Menlo, Consolas, Monaco, monospace;
    display: block;
    padding: 8px 8px 8px 52px;
    line-height: 1.53;
    font-size: 13px;
    margin: 0;
    margin-top: 8px;
    margin-bottom: 8px;
    tab-size: 2;
    overflow-x: auto;
    position: relative;

    &:before {
      content: attr(data-gutter);
      position: absolute;
      background-color: #eee;
      left: 0;
      top: 0;
      border-right: 1px solid #ccc;
      padding: 8px;
      color: #777;
      white-space: pre-wrap;
      text-align: right;
      min-width: 25px;
    }

    &:after {
      content: attr(data-highlight-language);
      top: 0;
      right: 3px;
      padding: 3px;
      font-size: 10px;
      text-transform: uppercase;
      position: absolute;
      color: rgba(0, 0, 0, 0.5);
    }
  `,
  codeHighlight: {
    atrule: css`
      color: #07a;
    `,
    attr: css`
      color: #07a;
    `,
    boolean: css`
      color: #905;
    `,
    builtin: css`
      color: #690;
    `,
    cdata: css`
      color: slategray;
    `,
    char: css`
      color: #690;
    `,
    class: css`
      color: #dd4a68;
    `,
    'class-name': css`
      color: #dd4a68;
    `,
    comment: css`
      color: slategray;
    `,
    constant: css`
      color: #905;
    `,
    deleted: css`
      color: #905;
    `,
    doctype: css`
      color: slategray;
    `,
    entity: css`
      color: #9a6e3a;
    `,
    function: css`
      color: #dd4a68;
    `,
    important: css`
      color: #e90;
    `,
    inserted: css`
      color: #690;
    `,
    keyword: css`
      color: #07a;
    `,
    namespace: css`
      color: #e90;
    `,
    number: css`
      color: #905;
    `,
    operator: css`
      color: #9a6e3a;
    `,
    prolog: css`
      color: slategray;
    `,
    property: css`
      color: #905;
    `,
    punctuation: css`
      color: #dd4a68;
    `,
    regex: css`
      color: #e90;
    `,
    selector: css`
      color: #690;
    `,
    string: css`
      color: #690;
    `,
    symbol: css`
      color: #905;
    `,
    tag: css`
      color: #905;
    `,
    url: css`
      color: #9a6e3a;
    `,
    variable: css`
      color: #e90;
    `,
  },
  image: css`
    cursor: default;
    display: inline-block;
    position: relative;
    max-width: 100%;

    img {
      max-width: 100%;
    }
  `,
}
