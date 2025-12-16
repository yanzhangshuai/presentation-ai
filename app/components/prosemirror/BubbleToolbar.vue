<script setup lang="ts">
import type { EditorView } from 'prosemirror-view'

import { computed } from 'vue'
import { setBlockType, toggleMark } from 'prosemirror-commands'

import type { BubbleMenuState } from '~/utils/prosemirror/plugins/bubbleMenu'

const props = defineProps<{
  editorView : EditorView | undefined
  bubbleState: BubbleMenuState | null
}>()

// ---------------- command helpers ----------------
function toggleMark2(markName: 'strong' | 'em' | 'code') {
  if (!props.editorView)
    return
  const { state, dispatch } = props.editorView
  const mark = state.schema.marks[markName]
  if (!mark)
    return
  toggleMark(mark)(state, dispatch)
  props.editorView.focus()
}

const isBold = computed(() => {
  if (!props.editorView)
    return false
  const { state } = props.editorView
  const marks = state.storedMarks || state.selection.$from.marks()
  return state.schema.marks.strong?.isInSet(marks) != null
})

const isItalic = computed(() => {
  if (!props.editorView)
    return false
  const { state } = props.editorView
  const marks = state.storedMarks || state.selection.$from.marks()
  return state.schema.marks.em?.isInSet(marks) != null
})

const isCodeBlock = computed(() => {
  if (!props.editorView)
    return false
  const { state } = props.editorView
  return state.selection.$from.parent.type === state.schema.nodes.code_block
})
</script>

<template>
  <div
    v-if="bubbleState?.visible"
    class="absolute bg-white border shadow-md rounded-md flex gap-2 p-2 z-50"
    :style="{ top: `${bubbleState.coords.top}px`, left: `${bubbleState.coords.left}px` }"
  >
    <button
      :class="{ active: isBold }"
      title="Bold"
      @click="toggleMark2('strong')"
    >
      B
    </button>
    <button
      :class="{ active: isItalic }"
      title="Italic"
      @click="toggleMark2('em')"
    >
      I
    </button>
    <button
      :class="{ active: isCodeBlock }"
      title="Code Block"
      @click="toggleMark2('code')"
    >
      Code
    </button>
  </div>
</template>

<style scoped>
button {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}
button.active {
  background-color: #eee;
}
</style>
