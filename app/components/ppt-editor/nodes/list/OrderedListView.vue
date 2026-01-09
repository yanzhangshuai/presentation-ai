<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3'

import { NodeViewContent, NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps<NodeViewProps>()

const columnsClass = computed(() => {
  const len = props.node.children.length

  if (len === 1)
    return 'grid-cols-1'

  if (len === 2)
    return 'grid-cols-2'

  return 'grid-cols-3'
})
</script>

<template>
  <NodeViewWrapper :id="node.attrs.id" class="my-6" :data-count="node.attrs.count">
    <NodeViewContent class="grid gap-6" :class="[columnsClass]" />
  </NodeViewWrapper>
</template>

<style scoped lang="less">

</style>
