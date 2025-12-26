import type { NodeViewProps } from '@tiptap/vue-3'
import type { Node as PMNode } from '@tiptap/pm/model'

import { computed } from 'vue'

export function useNodeIndex(props: NodeViewProps) {
  const resolved = computed(() => {
    const pos = props.getPos?.()
    if (typeof pos !== 'number')
      return null
    return props.editor.state.doc.resolve(pos)
  })

  const parentNode = computed<PMNode | null>(() => {
    if (!resolved.value)
      return null
    return resolved.value.parent
  })

  const index = computed(() => {
    if (!resolved.value)
      return -1
    return resolved.value.index()
  })

  const total = computed(() => {
    return parentNode.value?.childCount ?? 0
  })

  return {
    index,       // ✅ 0-based index of list_item
    total,       // ✅ total list_item count
    parentNode,  // ✅ bullet_list or ordered_list
  }
}
