<script setup lang="ts">
import type { Plugin } from 'prosemirror-state'

import { keymap } from 'prosemirror-keymap' // 导入 ProseMirror 的键盘快捷键插件
import { baseKeymap } from 'prosemirror-commands'
import { splitListItem } from 'prosemirror-schema-list' // 导入列表拆分命令，用于处理 Enter 键时拆分列表项

import MarkdownEditor from '~/components/prosemirror/MarkdownEditor.vue'

import { outlineParser, outlineSchema, outlineSerializer } from './meta'

const props = withDefaults(
  defineProps<{
    id           : string
    index        : number
    editable?    : boolean
    isGenerating?: boolean
  }>(),
  {
    editable: true,
  },
)

defineEmits<{
  delete: [id: string]
}>()

const content = defineModel<string>('value')

const plugins: Plugin[] = [
  keymap({
    Enter: (state, dispatch) => {
      const { $from } = state.selection // 获取当前光标位置

      const { list_item, paragraph } = state.schema.nodes // 获取 schema 中的节点类型

      // 光标在段落内时，尝试插入列表项
      if ($from.parent.type.name === paragraph?.name) {
        // 再次判断光标所在节点是否为段落
        if (!$from.parent || $from.parent.type !== paragraph || !list_item)
          return false

        // 光标在段首或段中间，都用 splitListItem 来拆分列表项
        return splitListItem(list_item)(state, dispatch)
      }

      // 光标不在段落中，则不执行拆分
      return false
    },
  }),
  keymap(baseKeymap),
]
</script>

<template>
  <li
    class="
          group flex items-center gap-4 rounded-md p-4 space-y-2 mb-2 relative
        bg-gray-100 hover:bg-gray-200 hover:shadow-md
          dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:hover:shadow-xl
        "
  >
    <UIcon
      name="i-lucide-grip-vertical"
      class="drag-handle text-xl text-muted-foreground hover:text-foreground"
      :class="{
        'cursor-move': !isGenerating,
        'cursor-no-drop': isGenerating,
      }"
    />

    <!-- index -->
    <span class="text-indigo-400">{{ index + 1 }}</span>

    <!-- editor -->
    <MarkdownEditor
      v-model:value="content"
      class="flex-1"
      :show-toolbar="false"
      :editable="editable"
      :schema="outlineSchema"
      :parse="outlineParser"
      :serializer="outlineSerializer"
      :plugins="plugins"
    />

    <!-- delete -->
    <UIcon
      v-if="editable"
      name="i-lucide-x"
      class="cursor-pointer text-2xl text-muted-foreground opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
      @click="$emit('delete', id)"
    />
  </li>
</template>
