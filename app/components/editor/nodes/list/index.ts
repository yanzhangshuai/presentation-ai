import type { Editor } from '@tiptap/vue-3'

import { Plugin } from 'prosemirror-state'
import _ListItem from '@tiptap/extension-list-item'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import _BulletList from '@tiptap/extension-bullet-list'
import _OrderedList from '@tiptap/extension-ordered-list'

import ListItemView from './ItemListView.vue'
import BulletListView from './BulletListView.vue'
import OrderedListView from './OrderedListView.vue'

export const ListItemKey = 'list_item'
export const ListItem = _ListItem.extend({
  name: ListItemKey, // 与旧数据保持一致

  content: 'heading paragraph',

  addAttributes() {
    return {
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

  // addNodeView() {
  //   return VueNodeViewRenderer(ListItemView)
  // },

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

const BulletListKey = 'bulleted_list'
export const BulletList = _BulletList.extend({
  name: BulletListKey,
  addAttributes() {
    return {
      ...this.parent?.(),
      count: {
        default  : 1,
        parseHTML: (element) => {
          const count = element.querySelectorAll('li').length
          return count || 1
        },
        renderHTML: attrs => ({
          'data-count': attrs.count,
        }),
      },

    }
  },
  // addNodeView() {
  //   return VueNodeViewRenderer(BulletListView)
  // },
}).configure({
  itemTypeName: ListItemKey, // 让子项引用的是 list_item\
})

export const OrderedList = _OrderedList.extend({
  name: 'ordered_list',
  addNodeView() {
    return VueNodeViewRenderer(OrderedListView)
  },
}).configure({
  itemTypeName: ListItemKey,
})
