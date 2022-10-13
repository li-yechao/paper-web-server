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

import { CodeNode as CodeNode_ } from '@lexical/code'
import { ElementTransformer } from '@lexical/markdown'
import {
  $createLineBreakNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalEditor,
  NodeKey,
} from 'lexical'

export default class CodeNode extends CodeNode_ {
  static override getType() {
    return 'code'
  }

  static override clone(node: CodeNode) {
    return new CodeNode(node.__language, node.__key)
  }

  static override importDOM(): DOMConversionMap {
    return {
      // Typically <pre> is used for code blocks, and <code> for inline code styles
      // but if it's a multi line <code> we'll create a block. Pass through to
      // inline format handled by TextNode otherwise
      code: node => {
        const isMultiLine = node.textContent != null && /\r?\n/.test(node.textContent)
        return isMultiLine
          ? {
              conversion: convertPreElement,
              priority: 1,
            }
          : null
      },
      div: () => ({
        conversion: convertDivElement,
        priority: 1,
      }),
      pre: () => ({
        conversion: convertPreElement,
        priority: 0,
      }),
      table: node => {
        const table = node // domNode is a <table> since we matched it by nodeName

        if (isGitHubCodeTable(table)) {
          return {
            conversion: convertTableElement,
            priority: 4,
          }
        }

        return null
      },
      td: node => {
        // element is a <td> since we matched it by nodeName
        const td = node
        const table = td.closest('table')

        if (isGitHubCodeCell(td)) {
          return {
            conversion: convertTableCellElement,
            priority: 4,
          }
        }

        if (table && isGitHubCodeTable(table)) {
          // Return a no-op if it's a table cell in a code table, but not a code line.
          // Otherwise it'll fall back to the T
          return {
            conversion: convertCodeNoop,
            priority: 4,
          }
        }

        return null
      },
      tr: node => {
        // element is a <tr> since we matched it by nodeName
        const tr = node
        const table = tr.closest('table')

        if (table && isGitHubCodeTable(table)) {
          return {
            conversion: convertCodeNoop,
            priority: 4,
          }
        }

        return null
      },
    }
  }

  static override importJSON(serializedNode: any) {
    return $createCodeNode(serializedNode.language)
  }

  constructor(language?: string | null, key?: NodeKey) {
    super(key)
    this.__language = language?.trim() || undefined
  }

  override exportJSON() {
    return super.exportJSON()
  }

  override exportDOM(editor: LexicalEditor): DOMExportOutput {
    let { element } = super.exportDOM(editor)
    console.log(element)
    if (element) {
      const pre = document.createElement('pre')
      pre.appendChild(element)
      element = pre
    }
    return {
      element,
    }
  }
}

export function $createCodeNode(language?: string) {
  return new CodeNode(language)
}

export function $isCodeNode(node: any): node is CodeNode {
  return node instanceof CodeNode
}

function isCodeElement(div: HTMLElement) {
  return div.style.fontFamily.match('monospace') !== null
}

function isGitHubCodeCell(cell: HTMLElement) {
  return cell.classList.contains('js-file-line')
}

function isGitHubCodeTable(table: HTMLElement) {
  return table.classList.contains('js-file-line-container')
}

function convertPreElement() {
  return {
    node: $createCodeNode(),
    preformatted: true,
  }
}

function convertDivElement(domNode: HTMLElement): DOMConversionOutput {
  // domNode is a <div> since we matched it by nodeName
  const div = domNode
  const isCode = isCodeElement(div)
  return {
    after: childLexicalNodes => {
      const domParent = domNode.parentNode

      if (domParent != null && domNode !== domParent.lastChild) {
        childLexicalNodes.push($createLineBreakNode())
      }

      return childLexicalNodes
    },
    node: isCode ? $createCodeNode() : null,
    preformatted: isCode,
  }
}

function convertTableElement() {
  return {
    node: $createCodeNode(),
    preformatted: true,
  }
}

function convertCodeNoop() {
  return {
    node: null,
  }
}

function convertTableCellElement(domNode: HTMLElement): DOMConversionOutput {
  // domNode is a <td> since we matched it by nodeName
  const cell = domNode
  return {
    after: childLexicalNodes => {
      if (cell.parentNode && cell.parentNode.nextSibling) {
        // Append newline between code lines
        childLexicalNodes.push($createLineBreakNode())
      }

      return childLexicalNodes
    },
    node: null,
  }
}

const createBlockNode = (createNode: (match: any) => any) => {
  return (parentNode: any, children: any, match: any) => {
    const node = createNode(match)
    node.append(...children)
    parentNode.replace(node)
    node.select(0, 0)
  }
}

export const CODE: ElementTransformer = {
  dependencies: [CodeNode],
  export: node => {
    if (!$isCodeNode(node)) {
      return null
    }

    const textContent = node.getTextContent()
    return (
      '```' + (node.getLanguage() || '') + (textContent ? '\n' + textContent : '') + '\n' + '```'
    )
  },
  regExp: /^```(\w{1,10})?\s/,
  replace: createBlockNode(match => {
    return $createCodeNode((match && match[1]?.trim()) || undefined)
  }),
  type: 'element',
}
