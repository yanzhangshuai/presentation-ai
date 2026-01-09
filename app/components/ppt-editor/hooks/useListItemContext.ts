// composables/useListItemContext.ts
import type { NodeViewProps } from '@tiptap/vue-3'

import { useNodeIndex } from './useNodeIndex'

export function useListItemContext(props: NodeViewProps) {
  const {
    index,
    parentNode,
  } = useNodeIndex(props)

  const listAttrs = computed(() => parentNode.value?.attrs ?? {})

  return {
    index,
    parentNode,
    listAttrs,
  }
}
