<script setup lang="ts">
import Text from '@tiptap/extension-text'
import { Markdown } from 'tiptap-markdown'
import Heading from '@tiptap/extension-heading'
import Document from '@tiptap/extension-document'
import ListItem from '@tiptap/extension-list-item'
import Paragraph from '@tiptap/extension-paragraph'
import BulletList from '@tiptap/extension-bullet-list'
import { EditorContent,  useEditor  } from '@tiptap/vue-3'

const props = withDefaults(defineProps<{
  editable?: boolean
}>(), {
  editable: true,
})

const emit = defineEmits<{
  'update:modelValue': [content: string]
  'change'           : [content: string]
  'blur'             : [content: string, event: FocusEvent]
  'focus'            : [event: FocusEvent]
}>()

const content = defineModel<string>('value', {
  required: false,
  default : '',
})

// 创建编辑器实例
const editor = useEditor({
  content   : content.value,
  extensions: [
    Document.extend({
      content: 'heading bulletList',
    }),
    // 直接在这里配置 Heading，避免 extend 带来的类型困扰
    Heading.configure({
      levels: [1],
    }),
    BulletList.configure({
      HTMLAttributes: {
        'data-tight': 'true',
      },
    }),
    ListItem.extend({
      content: 'paragraph',
    }),
    Paragraph,
    Text,
    Markdown,
  ],
  editable   : props.editable,
  editorProps: {
    attributes: {
      class: 'prose max-w-none dark:prose-invert focus:outline-none focus:ring-0 mb-0',
    },
    handleDOMEvents: {
      blur: (view, event) => {
        emit('blur', view.state.doc.textContent, event as FocusEvent)
        return false
      },
      focus: (_view, event) => {
        emit('focus', event as FocusEvent)
        return false
      },
    },
  },
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    emit('update:modelValue', html)
    emit('change', html)
    content.value = html
  },
  onBlur: ({ editor, event }) => {
    emit('blur', editor.getHTML(), event as FocusEvent)
  },
  onFocus: ({ event }) => {
    emit('focus', event as FocusEvent)
  },
})

// 监听 content 变化，从外部更新编辑器内容
watch(content,  (newValue) => {
  if (editor.value && newValue !== editor.value.getHTML()) {
    editor.value.commands.setContent(newValue)
  }
})

// 监听 editable 变化
watch(
  () => props.editable,
  (newValue) => {
    if (editor.value) {
      editor.value.setEditable(newValue)
    }
  },
)

// 暴露编辑器实例
defineExpose({
  getEditor: () => editor.value,
})

// 组件卸载时销毁编辑器
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<template>
  <EditorContent :editor="editor" class="prose max-w-none dark:prose-invert focus:outline-none focus:ring-0 mb-0" />
</template>

<style lang="less" scoped>
:deep(.tiptap) {
  outline: none !important;
  position: relative !important;

  &:focus {
    outline: none !important;
  }

  // 保持与原来相似的样式
  min-height: 100px;

  &.ProseMirror {
    > * + * {
      margin-top: 0.75em;
    }

    ul, ol {
      padding: 0 1rem;
    }

    h1, h2, h3, h4, h5, h6 {
      line-height: 1.1;
    }
  }
}
</style>
