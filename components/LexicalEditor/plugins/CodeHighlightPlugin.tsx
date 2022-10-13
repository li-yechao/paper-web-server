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

import { registerCodeHighlighting } from '@lexical/code'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import { $getNodeByKey, $isLineBreakNode, LexicalEditor } from 'lexical'
import { useEffect } from 'react'
import CodeNode, { $isCodeNode } from '../nodes/CodeNode'

export default function CodeHighlightPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return mergeRegister(_registerCodeHighlighting(editor), registerCodeHighlighting(editor))
  }, [editor])

  return null
}

function _registerCodeHighlighting(editor: LexicalEditor) {
  return editor.registerMutationListener(CodeNode, mutations => {
    editor.update(() => {
      for (const [key, type] of mutations) {
        if (type !== 'destroyed') {
          const node = $getNodeByKey(key)

          if ($isCodeNode(node)) {
            updateCodeGutter(node, editor)
          }
        }
      }
    })
  })
}

function updateCodeGutter(node: CodeNode, editor: LexicalEditor) {
  const codeElement = editor.getElementByKey(node.getKey())

  if (codeElement === null) {
    return
  }

  const children = node.getChildren()
  const childrenLength = children.length

  if (childrenLength === (codeElement as any).__cachedChildrenLength) {
    // Avoid updating the attribute if the children length hasn't changed.
    return
  }

  ;(codeElement as any).__cachedChildrenLength = childrenLength
  let gutter = '1'
  let count = 1

  for (let i = 0; i < childrenLength; i++) {
    if ($isLineBreakNode(children[i])) {
      gutter += '\n' + ++count
    } else {
      let c = children[i]?.getTextContent().match(/\n/g)?.length || 0
      for (; c > 0; c--) {
        gutter += '\n' + ++count
      }
    }
  }

  codeElement.setAttribute('data-gutter', gutter)
}
