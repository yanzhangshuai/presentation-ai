<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import type { EditorView } from '@tiptap/pm/view'
import type { EditorState } from '@tiptap/pm/state'
import type { Editor as Editor2 } from '@tiptap/core'

import { BubbleMenu } from '@tiptap/vue-3/menus'

import NodeSelect from './node-select.vue'
import { useTargetDecoration } from '../../hooks/useTargetDecoration'

const props = defineProps<{ editor: Editor }>()
// const { getPos } = useTargetDecoration(props.editor)

// const shouldShow = (
//   props:
//   { editor: Editor, element: HTMLElement, view: EditorView, state: EditorState, oldState: EditorState, from: number, to: number }) =>  {
//   const { state, from, to } = props
//   const { selection } = state

//   const pos  = getPos()
//   if (pos === null)
//     return false

//   return pos > 0
// }

const shouldShow = (props: {
  editor   : Editor2
  element  : HTMLElement
  view     : EditorView
  state    : EditorState
  oldState?: EditorState
  from     : number
  to       : number
}) =>  {
  const { state, from, to } = props
  const { selection } = state

  // return true
  return selection.from === from && selection.to === to && selection.empty === false
}
</script>

<template>
  <BubbleMenu
    v-if="editor"
    :editor="editor"
    :should-show="shouldShow"
  >
    <div
      :class="cn(
        'space-x-2',
        'flex select-none items-center absolute z-50 overflow-x-auto whitespace-nowrap rounded-md p-2 scrollbar-hide print:hidden max-w-[80vw]',
        'bg-white dark:bg-gray-800',
      )"
    >
      <NodeSelect class="w-36" :editor="editor" />
      <UButton @click="editor?.chain().focus().toggleBold().run()">
        Bold
      </UButton>
    </div>
    <!-- <div class="bg-black text-white px-2 py-1 text-sm">
      I am FloatingMenu
    </div>
    <UButton @click="editor?.chain().focus().toggleBold().run()">
      Bold
    </UButton> -->
  </BubbleMenu>
</template>
