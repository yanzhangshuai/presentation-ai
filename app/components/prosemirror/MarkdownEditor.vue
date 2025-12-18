<script setup lang="ts">
import type { Schema } from 'prosemirror-model'
import type { Plugin, Transaction } from 'prosemirror-state'
import type { MarkdownParser, MarkdownSerializer } from 'prosemirror-markdown'

import { EditorView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { onBeforeUnmount, shallowRef, toValue } from 'vue'
import { defaultMarkdownParser, defaultMarkdownSerializer, schema } from 'prosemirror-markdown'

import type { BubbleMenuState } from '~/utils/prosemirror/plugins/bubbleMenu'

import { bubbleMenuPlugin  } from '~/utils/prosemirror/plugins/bubbleMenu'

import BubbleToolbar from './BubbleToolbar.vue'

const props = withDefaults(defineProps<{
  schema?     : Schema
  parse?      : MarkdownParser
  serializer? : MarkdownSerializer
  plugins?    : Plugin[]
  editable?   : boolean | Ref<boolean>
  showToolbar?: boolean
}>(), {
  schema     : () => schema,
  parse      : () => defaultMarkdownParser,
  serializer : () => defaultMarkdownSerializer,
  plugins    : () => [],
  editable   : true,
  showToolbar: true,
})

const emit = defineEmits<{
  change: [content: string]
  blur  : [content: string, event: FocusEvent]
  focus : [event: FocusEvent]
}>()

const content = defineModel<string>('value', {
  required: false,
  default : '',
})

const editorRef = useTemplateRef('editor')
const view = shallowRef<EditorView>()
// ---------------- bubble menu state ----------------
const bubbleMenuState = shallowRef<BubbleMenuState | null>(null)

watchEffect(() => {
  setContent(toValue(content))
})

/** 安全地将 Vue v-model 同步到 ProseMirror，不破坏光标 */
// function syncValueToEditor(value: string) {
//   if (!view.value)
//     return
//   const currentMD = props.serializer.serialize(view.value.state.doc)
//   if (value === currentMD)
//     return // 内容相同，不操作
//   const doc = props.parse.parse(value)
//   const tr = view.value.state.tr.replaceWith(
//     0,
//     view.value.state.doc.content.size,
//     doc.content,
//   )
//   view.value.dispatch(tr)
// }

// watch(content, (val) => {
//   if (val != null)
//     syncValueToEditor(val)
// })
/**
 * 设置编辑器内容
 * @param content 新内容
 * @param emitUpdate 是否触发 onChange 回调
 */
function setContent(content: string, emitUpdate = false) {
  if (!view.value)
    return

  const { parse, serializer, schema } = props

  // 将 Markdown 内容解析为 ProseMirror 节点树
  const doc = parse.parse(content)

  // 创建新的 EditorState
  const newState = EditorState.create({
    doc,
    schema,
    plugins: view.value.state.plugins, // 保留已有插件
  })

  // 更新 EditorView 的 state，不触发 dispatchTransaction
  view.value.updateState(newState)

  // 可选触发 onChange 回调
  if (emitUpdate) {
    const md = serializer.serialize(newState.doc)
    emit('change', md)
  }
}

// ---------------- mount editor ----------------

onMounted(() => {
  const doc = toValue(content) ? props.parse.parse(toValue(content)) : undefined

  const allPlugins = ([] as Plugin[])
    .concat(props.showToolbar
      ? bubbleMenuPlugin(text => bubbleMenuState.value = text)
      : [],
    )
    .concat(props.plugins ?? [])

  const state = EditorState.create({
    doc,
    schema : props.schema,
    plugins: allPlugins,
  })

  let rafPending = false
  view.value = new EditorView(toValue(editorRef)!, {
    state,
    editable: () => toValue(props.editable),
    dispatchTransaction(tr) {
      if (!view.value)
        return

      const newState = view.value.state.apply(tr)
      view.value.updateState(newState)

      if (!rafPending) {
        rafPending = true
        requestAnimationFrame(() => {
          rafPending = false
          const md = props.serializer.serialize(newState.doc)
          emit('change', md)
          content.value = md
        })
      }
    },
    handleDOMEvents: {
      blur(view, event) {
        emit('blur', props.serializer.serialize(view.state.doc), event)
        return false
      },
      focus(_view, event) {
        emit('focus', event)
        return false
      },
    },
  })
})

onBeforeUnmount(() => {
  if (view.value) {
    view.value.destroy()
    view.value = undefined
  }
})

defineExpose({
  getEditorView: () => toValue(view),
})
</script>

<template>
  <div class="relative">
    <div ref="editor" class="prose max-w-none dark:prose-invert focus:outline-none focus:ring-0 mb-0" />
    <BubbleToolbar
      v-if="props.showToolbar"
      :editor-view="view"
      :bubble-state="bubbleMenuState"
    />
  </div>
</template>

<style lang="less" scoped>
:deep(.ProseMirror) {
  outline: none !important; /* 去掉默认的 focus 边框 */
  position: relative !important;
}

:deep(.ProseMirror-focused) {
  outline: none !important; /* 编辑器获取焦点时，仍去掉边框 */
}
</style>
