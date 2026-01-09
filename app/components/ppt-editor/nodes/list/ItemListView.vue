<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3'

import { NodeViewContent, NodeViewWrapper } from '@tiptap/vue-3'

import { useListItemContext } from '../../hooks/useListItemContext'

const props = defineProps<NodeViewProps>()
const {
  index,
  parentNode,
} = useListItemContext(props)

// const isOrder = computed(() => parentNode.value?.type.name !== OrderedList.name)
const isOrder = computed(() => true)

const backgroundColor = computed(() => {
  return (
    parentNode.value?.attrs?.color
    || 'var(--presentation-primary)'
  )
})
</script>

<template>
  <NodeViewWrapper :id="node.attrs.id" class="group/bullet-item relative flex items-start" :data-index="index">
    <div
      :class="cn(
        `h-12 w-12 flex shrink-0 items-center justify-center bg-primary rounded-full text-xl font-bold text-primary-foreground`,
        'transition-opacity')"
      :style="{ background: backgroundColor }"
      contenteditable="false"
    >
      {{ isOrder ? index + 1 : '' }}
    </div>

    <NodeViewContent class="ml-4 flex-1" />
  </NodeViewWrapper>
</template>

<style scoped lang="less"></style>
