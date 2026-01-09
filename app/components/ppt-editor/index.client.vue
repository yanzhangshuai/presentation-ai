<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3'

import type { SlideDoc } from '~/types/presentation'

import Container from './Container.vue'
import { nodeExtensions } from './nodes'
import { markExtensions } from './marks'
import { otherExtensions } from './extensions'
import Draggable from './components/Draggable.vue'
import ToolbarMenu from './components/toolbar/index.vue'

const props = withDefaults(defineProps<{
  doc?        : SlideDoc
  autoFocus?  : boolean
  editable?   : boolean
  showToolbar?: boolean
}>(), {
  editable   : true,
  autoFocus  : false,
  showToolbar: true,
  content    : () => [],
})

const emit = defineEmits<{
  update: [doc: SlideDoc]
  focus : [doc: SlideDoc, editor: Editor]
}>()

const editor = ref<Editor>()

const updateContent = (doc: SlideDoc) => {
  if (!editor.value || !doc)
    return
  editor.value.commands.setContent(toRaw(doc))
}

watch(
  () => props.editable,
  (val) => {
    if (editor.value)
      editor.value.setEditable(val)
  },
)

const getDoc = () => {
  return editor.value?.getJSON() as any as SlideDoc
}

const getEditor = () => {
  return editor.value
}

onMounted(() => {
  editor.value = new Editor({
    editorProps: {
      attributes: {
        // prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto
        class: 'focus:outline-none',
      },
    },
    extensions: [
      ...nodeExtensions,
      ...markExtensions,
      ...otherExtensions,

    ],
    content  : toRaw(props.doc) || null,
    editable : props.editable,
    autofocus: props.autoFocus,
    onUpdate : ({ editor }) => {
      emit('update', editor.getJSON() as any as SlideDoc)
    },
    onFocus: () => {
      // emit('focus', editor.value?.getJSON() as any as SlideDoc, editor.value!)
    },
  })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

// TODO: handle doc update from outside
// watch(
//   () => props.doc,
//   (val) => {
//     if (val && editor.value)
//       updateContent(val)
//   },
//   { immediate: true, deep: true },
// )

defineExpose({
  updateContent,
  getDoc,
  getEditor,
})
</script>

<template>
  <Container
    :editable="editable" :focused="autoFocus"
    class="relative flex flex-col border-none bg-transparent py-12 px-16 outline-none h-full"
  >
    <Draggable v-if="editor" :editor="editor" />
    <!-- <ToolbarMenu v-if="showToolbar && editor" :editor="editor" /> -->
    <EditorContent class="editor" :editor="editor" />
  </Container>
</template>

<style scoped lang="less">
.editor {
  min-height: 200px;
  min-width: 200px;
}

.has-focus {
  border-radius: 3px;
  box-shadow: 0 0 0 2px red;
}
</style>
