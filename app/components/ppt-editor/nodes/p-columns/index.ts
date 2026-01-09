import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'

import ColumnView from './ColumnView.vue'
import ColumnsView from './ColumnsView.vue'

export const PColumnKey = 'p_column'
export const PColumn = Node.create({
  name   : PColumnKey,
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
    return [{ tag: 'div.column' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0]
  },
  addNodeView() {
    return VueNodeViewRenderer(ColumnView)
  },
})

export const PColumnsKey = 'p_columns'
export const PColumns = Node.create({
  name   : PColumnsKey,
  group  : 'block',
  content: `${PColumnKey}+`,

  addAttributes() {
    return {
      id: {
        default: null,
      },
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

      direction: {
        default   : 'horizontal',
        parseHTML : element => element.getAttribute('data-direction') || 'horizontal',
        renderHTML: attrs => ({
          'data-direction': attrs.direction,
        }),
      },
    }
  },
  parseHTML() {
    return [{ tag: 'div.columns' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0]
  },
  addNodeView() {
    return VueNodeViewRenderer(ColumnsView)
  },
})
