import type { NodeViewProps } from '@tiptap/vue-3'
import type { ResolvedPos } from 'prosemirror-model'

import { computed } from 'vue'

export function useResolvedNodePosition(props: NodeViewProps) {
  const resolvedPos = computed<ResolvedPos | null>(() => {
    const pos = props.getPos()
    if (typeof pos !== 'number' || pos <= 0)
      return null
    return props.editor.state.doc.resolve(pos - 1)
  })

  return { resolvedPos }
}
