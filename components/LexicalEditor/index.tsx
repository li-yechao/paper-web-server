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
import { CodeHighlightNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { CHECK_LIST, CODE as CODE_, TRANSFORMERS } from '@lexical/markdown'
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { $createParagraphNode, EditorState, LexicalNode } from 'lexical'
import { ChangeEventHandler, ComponentProps, useCallback, useEffect, useMemo, useRef } from 'react'
import CodeNode, { CODE } from './nodes/CodeNode'
import { $createEquationNode, $isEquationNode, EquationNode } from './nodes/EquationNode'
import { ImageNode } from './nodes/ImageNode'
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin'
import ImagePlugin from './plugins/ImagePlugin'
import TrailingParagraphPlugin from './plugins/TrailingParagraphPlugin'
import theme from './themes/theme'

export interface LexicalEditorProps {
  className?: string
  defaultValue?: string
  readOnly?: boolean
  onChange?: (editorState: EditorState) => void
}

export default function LexicalEditor(props: LexicalEditorProps) {
  const imageInput = useRef<HTMLInputElement>(null)

  const onImageInputChange = useRef<ChangeEventHandler<HTMLInputElement>>()

  const handleImageInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(e => {
    onImageInputChange.current?.(e)
  }, [])

  const initialConfig = useMemo<ComponentProps<typeof LexicalComposer>['initialConfig']>(
    () => ({
      namespace: 'editor',
      editable: !props.readOnly,
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
        EquationNode,
      ],
      theme,
      onError: e => {
        throw e
      },
      editorState: props.defaultValue,
    }),
    []
  )

  const autoLinkMatchers = useMemo(() => {
    const URL_MATCHER =
      /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

    const EMAIL_MATCHER =
      /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/

    return [
      (text: string) => {
        const match = URL_MATCHER.exec(text)
        return match?.[0]
          ? {
              index: match.index,
              length: match[0].length,
              text: match[0],
              url: match[0],
            }
          : null
      },
      (text: string) => {
        const match = EMAIL_MATCHER.exec(text)
        return match?.[0]
          ? {
              index: match.index,
              length: match[0].length,
              text: match[0],
              url: `mailto:${match[0]}`,
            }
          : null
      },
    ]
  }, [])

  const transformers = useMemo<
    ComponentProps<typeof MarkdownShortcutPlugin>['transformers']
  >(() => {
    const exportEquation = (node: LexicalNode) => {
      if (!$isEquationNode(node)) {
        return null
      }
      const inline = node.getInline()
      const equation = node.getEquation()
      if (inline) {
        return `$${equation}$`
      } else {
        return `$$${equation}$$`
      }
    }

    return [
      CHECK_LIST,
      ...TRANSFORMERS.filter(i => i !== CODE_),
      CODE,
      {
        dependencies: [EquationNode],
        export: exportEquation,
        importRegExp: /\$(\S+)\$/,
        regExp: /\$(.+)\$$/,
        replace: (textNode, match) => {
          textNode.replace($createEquationNode(match[1], true))
        },
        trigger: '$',
        type: 'text-match',
      },
      {
        dependencies: [EquationNode],
        export: exportEquation,
        regExp: /^\$\$\s/,
        replace: parentNode => {
          parentNode.replace($createParagraphNode().append($createEquationNode('', false)))
        },
        type: 'element',
      },
    ]
  }, [])

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorContainer className={props.className}>
        <_ImageInput
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageInputChange}
          ref={imageInput}
        />

        <RichTextPlugin
          contentEditable={<ContentEditable className="lexical-editor" testid="lexical-editor" />}
          placeholder={<Placeholder>Input something...</Placeholder>}
        />
        {props.onChange && <OnChangePlugin onChange={props.onChange} />}
        <AutoLinkPlugin matchers={autoLinkMatchers} />
        <LinkPlugin />
        <CodeHighlightPlugin />
        <MarkdownShortcutPlugin transformers={transformers} />
        <ListPlugin />
        <CheckListPlugin />
        <HistoryPlugin />

        <NoAutoFocusPlugin />
        <EditablePlugin editable={!props.readOnly} />
        <TrailingParagraphPlugin />
        <ImagePlugin />
        <TablePlugin />
      </EditorContainer>
    </LexicalComposer>
  )
}

const NoAutoFocusPlugin = () => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    setTimeout(() => {
      editor.blur()
    })
  }, [editor])

  return null
}

const EditablePlugin = ({ editable }: { editable: boolean }) => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editor.setEditable(editable)
  }, [editor, editable])

  return null
}

const EditorContainer = styled.div`
  --background-color: #ffffff;
  --app-bar-color: #f2f2f7;
  --color: #000000;

  @media (prefers-color-scheme: dark) {
    --background-color: #000000;
    --app-bar-color: #1c1c1e;
    --color: #ffffff;
  }

  position: relative;
  background-color: var(--background-color);
  color: var(--color);
  font-family: -apple-system, system-ui, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif,
    BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial;
  font-size: 15px;
  line-height: 1.6;
  margin: 16px;

  > .lexical-editor {
    outline: none;
    min-height: calc(100vh - 32px);
  }
`

const _ImageInput = styled.input`
  position: fixed;
  left: -1000px;
  top: 0;
`

const Placeholder = styled.div`
  font-size: 14px;
  color: #999;
  overflow: hidden;
  position: absolute;
  text-overflow: ellipsis;
  left: 0;
  top: 0;
  user-select: none;
  white-space: nowrap;
  display: inline-block;
  pointer-events: none;
`
