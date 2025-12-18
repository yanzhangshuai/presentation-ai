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
    group: 'block',
    attrs: {
      id   : { default: null },
      count: { default: 2 },
    },
    content: 'block+',
    toDOM() {
      return ['div', { class: 'columns' }, 0]
    },
  },
})

export const slideSchema = new Schema({
  nodes,
  marks: basic.spec.marks,
})
