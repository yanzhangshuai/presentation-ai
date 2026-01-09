import { Schema } from 'prosemirror-model'
import { addListNodes } from 'prosemirror-schema-list'
import { schema as basic } from 'prosemirror-schema-basic'

const baseNodes = addListNodes(
  basic.spec.nodes,
  'paragraph block*',
  'block',
)

/* ---------- custom nodes ---------- */

const nodes = baseNodes.append({
  image: {
    inline   : false,
    group    : 'block',
    draggable: true,
    attrs    : {
      id    : { default: null },
      query : { default: null },
      status: { default: 'placeholder' },
    },
    parseDOM: [{
      tag     : 'img[data-query]',
      getAttrs: dom => ({
        query: (dom as HTMLElement).getAttribute('data-query'),
      }),
    }],
    toDOM(node) {
      return ['img', {
        'data-query': node.attrs.query,
        'style'     : 'max-width: 100%',
      }]
    },
  },

  columns: {
    group  : 'block',
    content: 'column+',
    attrs  : {
      id   : { default: null },
      count: { default: 2 },
    },
    toDOM() {
      return ['div', { class: 'columns' }, 0]
    },
  },

  column: {
    content: 'block+',
    toDOM() {
      return ['div', { class: 'column' }, 0]
    },
  },
})

export const schema = new Schema({
  nodes,
  marks: basic.spec.marks,
})
