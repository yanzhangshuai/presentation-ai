<script setup lang="ts">
import type { Editor } from '@tiptap/core'

import { offset } from '@floating-ui/dom'
import { DragHandle } from '@tiptap/extension-drag-handle-vue-3'

import { useTargetDecoration } from '../hooks/useTargetDecoration'

const props = defineProps<{
  editor: Editor
}>()

const decoration = useTargetDecoration(props.editor)

onMounted(() => {
})

const handleNodeChange = ({ pos }: { pos: number }) => {
  // pos >= 0 && props.editor.commands.setNodeSelection(pos)
  decoration.set(pos)
}
</script>

<template>
  <DragHandle
    :editor="editor"
    :locaked="true"
    :compute-position-config="{
      placement: 'left-start',
      strategy: 'absolute',
      middleware: [offset({ crossAxis: 10 })],
    }"
    @node-change="handleNodeChange"
  >
    <UButton variant="ghost" size="sm" class="p-0">
      <UIcon name="i-lucide-grip-vertical" class="text-muted-foreground h-6 w-6 cursor-grab active:cursor-grabbing" />
    </UButton>
  </DragHandle>
</template>

<style scoped lang="less"></style>
