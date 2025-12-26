import type { Editor } from '@tiptap/vue-3'

export const useSlideEditor = createGlobalState(() => {
  const editor = ref<Editor | null>(null)

  function setEditor(e: Editor) {
    editor.value = e
  }

  return {
    editor,
    setEditor,
  }
})
