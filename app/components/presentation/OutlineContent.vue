<script setup lang="ts">
import { keymap } from 'prosemirror-keymap' // 导入 ProseMirror 的键盘快捷键插件
import { baseKeymap } from 'prosemirror-commands'
import { splitListItem } from 'prosemirror-schema-list' // 导入列表拆分命令，用于处理 Enter 键时拆分列表项

import { defineCommands } from '~/utils/prosemirror/commands' // 自定义命令管理工具
import { outlineParser, outlineSchema, outlineSerializer } from '~/utils/prosemirror/outlineSchema'

const props = withDefaults(
  defineProps<{
    editable?: boolean
  }>(),
  {
    editable: true,
  },
)

// --- value ---
// 定义一个响应式变量 content，用来存储编辑器内容
const content = defineModel<string>()

const editable = toRef(props, 'editable', true)

/**
 * 标记是否来自 Editor 内部更新
 */
// const isEditorUpdating = ref(false)

// const isEditable = toRef('editable', props)

// 定义编辑器命令
const commandsDesc = defineCommands([
  {
    name: 'splitListItem', // 命令名称
    type: 'custom',        // 命令类型，这里是自定义类型
    run : ({ state, dispatch }) => {
      const { $from } = state.selection // 获取当前光标位置

      const { list_item, paragraph } = state.schema.nodes // 获取 schema 中的节点类型

      // 光标在段落内时，尝试插入列表项
      if ($from.parent.type.name === paragraph?.name) {
        // 如果不存在 list_item 节点，则不能拆分
        if (!list_item) {
          return false
        }

        // 再次判断光标所在节点是否为段落
        if (!$from.parent || $from.parent.type !== paragraph || !list_item)
          return false

        // 光标在段首或段中间，都用 splitListItem 来拆分列表项
        return splitListItem(list_item)(state, dispatch)
      }

      // 光标不在段落中，则不执行拆分
      return false
    },
  },
])

// 初始化编辑器
const { commands, mount, setContent } = useMarkdownEditor({
  editable,
  preset: {
    schema    : outlineSchema,   // 使用自定义的 schema
    parse     : outlineParser,   // 使用自定义的 Markdown Parser
    serializer: outlineSerializer, // 使用自定义的 Markdown Serializer
  },
  useDefaultPlugins: true, // 不使用默认插件
  plugins          : [
    keymap({
      Enter: (): boolean => toValue(commands)?.splitListItem() ?? false,
    }),
    keymap(baseKeymap),
  ],

  content: toValue(content), // 初始内容
  onBlur : (md) => {
    // isEditorUpdating.value = true
    content.value = md
    // nextTick(() => {
    //   isEditorUpdating.value = false
    // })
  },

  commandsDesc, // 注入自定义命令
})

// 获取编辑器容器的 ref
const containerRef = useTemplateRef('container')

/**
 * 仅当「外部」修改 content 才 setContent
 */
watch(content, (md) => {
  // if (isEditorUpdating.value)
  // return
  if (md != null) {
    setContent(md)
  }
})

// 编辑器挂载到 DOM 元素
onMounted(() => {
  if (containerRef.value) {
    mount(containerRef.value)
  }
})
</script>

<template>
  <!-- 编辑器工具栏按钮示例 -->
  <!-- <button @click="commands?.italic()">I</button> -->

  <!-- 编辑器容器 -->
  <div ref="container" class="prose max-w-none dark:prose-invert focus:outline-none focus:ring-0 mb-0" />
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
