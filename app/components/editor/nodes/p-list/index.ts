import type { Editor } from '@tiptap/vue-3'

import { Node } from '@tiptap/core'
import { Plugin } from 'prosemirror-state'
import { VueNodeViewRenderer } from '@tiptap/vue-3'

import BulletListView from './ListView.vue'
import ListItemView from './ListItemView.vue'

export const PListItemKey = 'p_list_item'
export const PListItem = Node.create({
  name   : PListItemKey, // 与旧数据保持一致
  group  : 'block',
  content: 'block+',

  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,

      },
      index: {
        default   : 0,
        parseHTML : () => 0, // 不解析，完全由程序计算
        renderHTML: (attrs) => {
          // 只在index大于0时渲染到HTML
          return attrs.index > 0 ? { 'data-index': attrs.index } : {}
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div.p-list-item' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(ListItemView)
  },

  addProseMirrorPlugins() {
    return [
      // new Plugin({
      //   key: new PluginKey('listItemIndexSimple'),

      //   // 使用appendTransaction，只在事务提交时更新
      //   appendTransaction: (transactions, oldState, newState) => {
      //     // 只在文档内容真正变化时更新（忽略selection变化）
      //     const docChanged = transactions.some(tr => tr.docChanged)
      //     if (!docChanged)
      //       return null

      //     const { doc, tr } = newState
      //     let hasUpdates = false
      //     let transaction = tr

      //     // 遍历所有list-item
      //     doc.descendants((node, pos) => {
      //       if (node.type.name === 'list_item') {
      //         const resolvedPos = doc.resolve(pos)
      //         const parent = resolvedPos.parent

      //         // 只处理在列表中的list-item
      //         if (parent && (parent.type.name === 'bullet_list' || parent.type.name === 'ordered_list')) {
      //           // 计算当前list-item在列表中的位置
      //           let listItemCount = 0
      //           for (let i = 0; i <= resolvedPos.index(); i++) {
      //             if (parent.child(i).type.name === 'list_item') {
      //               listItemCount++
      //             }
      //           }

      //           // 只有当索引变化时才更新
      //           if (node.attrs.index !== listItemCount) {
      //             hasUpdates = true
      //             transaction = transaction.setNodeMarkup(pos, undefined, {
      //               ...node.attrs,
      //               index: listItemCount,
      //             })
      //           }
      //         }
      //       }
      //     })

      //     return hasUpdates ? transaction : null
      //   },
      // }),
    ]
  },

})

const PListKey = 'p_list'
export const PList = Node.create({
  name   : PListKey,
  group  : 'block',
  content: `${PListItemKey}+`,

  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
      },
      count: {
        default  : 1,
        parseHTML: (element) => {
          const count = element.querySelectorAll('.p-list-item').length
          return count || 1
        },
        renderHTML: attrs => ({
          'data-count': attrs.count,
        }),
      },
      direction: {
        default  : 'horizontal', // horizontal | vertical
        parseHTML: (element) => {
          return element.getAttribute('data-direction') || 'horizontal'
        },
        renderHTML: (attributes) => {
          if (!attributes.direction) {
            return {}
          }

          return {
            'data-direction': attributes.direction,
            'class'         : `bullet-list--${attributes.direction}`,
          }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div.p-list' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      setBulletListDirection: (direction: 'horizontal' | 'vertical') =>
        ({ editor }: { editor: Editor }) => {
          if (!editor.isActive('bulletList')) {
            // return editor.commands.toggleBulletList()
            //   .then(() => editor.commands.updateAttributes('bulletList', { direction }))
          }

          return editor.commands.updateAttributes('bulletList', { direction })
        },
      toggleBulletListDirection: () => {
        return ({ editor }: { editor: Editor }) => {
          if (!editor.isActive('bulletList')) {
            return editor.commands.toggleBulletList()
          }

          const currentDirection = editor.getAttributes('bulletList').direction || 'horizontal'
          const newDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal'

          return editor.commands.updateAttributes('bulletList', { direction: newDirection })
        }
      },
    } as any
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(_transactions, _oldState, newState) {
          let tr = newState.tr
          let changed = false

          newState.doc.descendants((node, pos) => {
            if (node.type.name === PListKey) {
              if (node.attrs.count == null) {
                const count = node.childCount || 1

                tr = tr.setNodeMarkup(pos, node.type, {
                  ...node.attrs,
                  count,
                })

                changed = true
              }
            }
          })

          return changed ? tr : null
        },
      }),
    ]
  },
  addNodeView() {
    return VueNodeViewRenderer(BulletListView)
  },
})
