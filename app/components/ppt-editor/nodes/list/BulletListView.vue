<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3'

import { UButton } from '#components'
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
  <NodeViewWrapper :id="node.attrs.id" class="my-6 relative" :data-count="node.attrs.count" :data-direction="node.attrs.direction">
    <NodeViewContent class="grid gap-6" :class="[columnsClass]" />
  </NodeViewWrapper>
</template>

<style scoped lang="less">
// [data-direction='horizontal'] {
//   display: flex !important;
//   flex-direction: row;
// }
// [data-direction='vertical'] {
//   display: flex !important;
//   flex-direction: column;
// }
</style>
