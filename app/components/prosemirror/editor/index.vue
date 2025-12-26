<script setup lang="ts">
import type { Plugin } from 'prosemirror-state'

import { EditorView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { onBeforeUnmount, onMounted, shallowRef, toValue, watch } from 'vue'

import type { BubbleMenuState } from '~/utils/prosemirror/plugins/bubbleMenu'

import { bubbleMenuPlugin  } from '~/utils/prosemirror/plugins/bubbleMenu'

import { schema } from './schema'
// import BubbleToolbar from './BubbleToolbar.vue'

const props = withDefaults(defineProps<{
  content?    : any[]
  plugins?    : Plugin[]
  editable?   : boolean | Ref<boolean>
  showToolbar?: boolean
}>(), {
  plugins    : () => [],
  editable   : true,
  showToolbar: true,
  content    : () => [],
})
const emit = defineEmits<{
  update: [doc: any]
}>()

const editorRef = useTemplateRef('editor')
const view = shallowRef<EditorView>()
// ---------------- bubble menu state ----------------
const bubbleMenuState = shallowRef<BubbleMenuState | null>(null)

/* ---------- helpers ---------- */

function createState(content: any[]) {
  return EditorState.create({
    schema,
    doc    : schema.nodeFromJSON({ type: 'doc', content: content || [] }),
    plugins: [
      ...(props.showToolbar
        ? [bubbleMenuPlugin(v => (bubbleMenuState.value = v))]
        : []),
      ...(props.plugins ?? []),
    ],
  })
}

function updateContent(content: any[]) {
  if (!view.value || !content)
    return
  view.value.updateState(createState(content))
}

function getContent() {
  const doc = view.value?.state.doc.toJSON()
  return doc?.content || []
}

/* ---------- sync external ---------- */

watch(
  () => props.content,
  (val) => {
    if (val && view.value)
      updateContent(val)
  },
  { immediate: true, deep: true },
)

/* ---------- mount ---------- */

onMounted(() => {
  const initState = createState(
    props.content ?? { type: 'doc', content: [] },
  )

  view.value = new EditorView(editorRef.value!, {
    state   : initState,
    editable: () => !!toValue(props.editable),
    dispatchTransaction(tr) {
      if (!view.value)
        return
      const newState = view.value.state.apply(tr)
      view.value.updateState(newState)
      emit('update', newState.doc.toJSON())
    },
  })
})

onBeforeUnmount(() => {
  view.value?.destroy()
  view.value = undefined
})

defineExpose({
  updateContent,
  getContent,
  getEditorView: () => view.value,
})
</script>

<template>
  <div class="content-editor">
    <div ref="editor" class="prosemirror-root" />
    <!-- <BubbleToolbar
      v-if="showToolbar"
      :editor-view="view"
      :bubble-state="bubbleMenuState"
    /> -->
  </div>
</template>

<style scoped>
:deep(.ProseMirror) {
  outline: none !important; /* 去掉默认的 focus 边框 */
  position: relative !important;
}

:deep(.ProseMirror-focused) {
  outline: none !important; /* 编辑器获取焦点时，仍去掉边框 */
}
</style>
