<script lang="ts" setup>
import type { NodeViewProps } from '@tiptap/vue-3'

import { NodeViewContent, NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps<NodeViewProps>()

const style = computed(() => {
  const index = props.node.attrs.index as number || 0

  const colors = [
    'var(--presentation-secondary)',
    'var(--presentation-accent)',
    
  ]
  return {
    borderRadius   : 'var(--presentation-border-radius, 0.5rem)',
    backgroundColor: colors[index % colors.length],
  }
})
</script>

<template>
  <NodeViewWrapper class="p-column p-4 relative hover:outline-1 outline-blue-400" :style="style" :data-selected="selected">
    <NodeViewContent class="column-content" />
  </NodeViewWrapper>
</template>

<style scoped>

</style>
