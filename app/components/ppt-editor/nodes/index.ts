import type { Extensions } from '@tiptap/vue-3'

import StarterKit from '@tiptap/starter-kit'

import { PList, PListItem } from './p-list'
import { PColumn, PColumns } from './p-columns'

export const nodeExtensions: Extensions = [
  StarterKit.configure({
    // bulletList : false,
    // orderedList: false,
    // listItem   : false,
    paragraph: {
      HTMLAttributes: {
        class: 'presentation-element presentation-paragraph presentation-text m-0 px-0 py-1 text-base',
      },
    },
    heading: {
      HTMLAttributes: {
        class: 'presentation-element presentation-heading',
      },
      levels: [1, 2, 3, 4, 5, 6],
    },

  }),

  PListItem.configure({
    HTMLAttributes: { class: 'presentation-element presentation-p-list-item flex items-start' },
  }),
  PList.configure({
    HTMLAttributes: { class: 'presentation-element presentation-p-list list-inside ml-5 mb-4' },
  }),
  PColumns.configure({
    HTMLAttributes: { class: 'presentation-element presentation-p-columns' },
  }),
  PColumn.configure({
    HTMLAttributes: { class: 'presentation-element presentation-p-column' },
  }),
]
export { PColumn as Column }
