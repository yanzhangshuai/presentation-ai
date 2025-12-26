<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3'

import { NodeViewContent, NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps<NodeViewProps>()

const columnsClass = computed(() => {
  if (props.node.attrs.direction === 'vertical')
    return 'grid-cols-1'

  const len = props.node.children.length

  if (len === 1)
    return 'grid-cols-1'

  if (len === 2)
    return 'grid-cols-2'

  return 'grid-cols-3'
})

const onToggleDirection = () => {
  props.updateAttributes({
    direction: props.node.attrs.direction === 'horizontal' ? 'vertical' : 'horizontal',
  })
}
</script>

<template>
  <NodeViewWrapper class="p-columns relative" :data-count="node.attrs.count" :data-direction="node.attrs.direction">
    <NodeViewContent :class="cn('grid gap-6', columnsClass)" />

    <div class="controls opacity-0">
      <UButton size="sm" variant="outline" class="absolute top-2 right-2 z-10" @click="onToggleDirection">
        {{ node.attrs.direction === 'horizontal' ? 'Vertical' : 'Horizontal' }}
      </UButton>
    </div>
  </NodeViewWrapper>
</template>

<style scoped lang="less">
.p-columns {
  &:hover .controls {
    opacity: 1;
  }
}
</style>
