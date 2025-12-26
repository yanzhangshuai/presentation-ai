import { Mark, mergeAttributes } from '@tiptap/vue-3'

export const GeneratingMark = Mark.create({
  name: 'generating',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-generating]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-generating': 'true' }), 0]
  },
})
