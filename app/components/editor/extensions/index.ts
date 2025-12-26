import type { Extensions } from '@tiptap/vue-3'

import { v4 as uuid } from 'uuid'
// import History from '@tiptap/extension-history'
// @ts-expect-error 没有类型定义
import UniqueId from 'tiptap-unique-id'
import NodeRange from '@tiptap/extension-node-range'
import { Focus, Placeholder } from '@tiptap/extensions'
import FloatingMenu from '@tiptap/extension-floating-menu'

import { TargetDecoration } from './targetDecoration'

const nodes = [
  'paragraph',
  'heading',
  'ordered_list',
  'bullet_list',
  'list_item',
  'p_column',
  'p_columns',
  'p_list_item',
  'p_list',
]

export const otherExtensions: Extensions = [
  // ✅ 如果你决定不用 UniqueId，可以直接删这一项
  UniqueId.configure({
    attributeName: 'id',
    types        : nodes,
    createId     : () => uuid(),
  }),
  Focus.configure({
    // className: 'outline outline-1 outline-blue-400',
    mode: 'shallowest',
  }),

  NodeRange.configure({
    key: null,
  }),

  TargetDecoration.configure({
    className   : 'outline outline-1 outline-blue-400',
    allowedTypes: nodes,
  }),
  FloatingMenu,
  Placeholder.configure({
    placeholder: 'Start typing...',
  }),

  // History,
]
