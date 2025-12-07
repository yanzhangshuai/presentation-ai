import type { Plugin } from 'prosemirror-state'
import type { Schema } from 'prosemirror-model'
import type { MarkdownParser, MarkdownSerializer } from 'prosemirror-markdown'

import { keymap } from 'prosemirror-keymap'
import { EditorView } from 'prosemirror-view'
import { history } from 'prosemirror-history'
import { EditorState } from 'prosemirror-state'
import { onBeforeUnmount, shallowRef } from 'vue'
import { baseKeymap } from 'prosemirror-commands'
import { defaultMarkdownParser, defaultMarkdownSerializer, schema } from 'prosemirror-markdown'

import type { EditorCommands, ProsemirrorCommandDesc } from '~/utils/prosemirror/commands'

import { createCommands, defaultCommands } from '~/utils/prosemirror/commands'

/**
 * 自定义 Markdown 编辑器 Hook
 * 封装 ProseMirror 编辑器的创建、挂载、插件和命令管理
 */
export function useMarkdownEditor<T extends readonly ProsemirrorCommandDesc[] = typeof defaultCommands>(options?: MarkdownEditorOptions<T>) {
  // 解构编辑器选项
  const {
    commandsDesc,
    preset,
    plugins,
    content,
    useDefaultPlugins = true,
    editable = true,
    onChange,
    onBlur,
    onFocus,
  } = options ?? {}

  // 如果有预设，则使用自定义 schema/parser/serializer，否则使用默认
  const { parse, serializer, schema: currentSchema } = preset ?? {
    parse     : defaultMarkdownParser,
    serializer: defaultMarkdownSerializer,
    schema,
  }

  /** EditorView ref，用于挂载编辑器实例 */
  const view = shallowRef<EditorView>()
  /** Commands ref，用于存储编辑器命令集合 */
  const commands = shallowRef<EditorCommands<T>>()

  /**
   * 设置编辑器内容
   * @param content 新内容
   * @param emitUpdate 是否触发 onChange 回调
   */
  function setContent(content: string, emitUpdate = false) {
    if (!view.value)
      return

    // 将 Markdown 内容解析为 ProseMirror 节点树
    const doc = parse.parse(content)

    // 创建新的 EditorState
    const newState = EditorState.create({
      doc,
      schema : currentSchema,
      plugins: view.value.state.plugins, // 保留已有插件
    })

    // 更新 EditorView 的 state，不触发 dispatchTransaction
    view.value.updateState(newState)

    // 可选触发 onChange 回调
    if (emitUpdate && onChange) {
      const markdown = serializer.serialize(newState.doc)
      onChange(markdown)
    }
  }

  /** 默认插件生成器 */
  function createDefaultPlugins(): Plugin[] {
    return [
      history(), // 撤销/重做支持
      keymap({
        'Mod-z'      : (_s, _d) => (commands.value as EditorCommands<typeof defaultCommands>)?.undo() ?? false,
        'Mod-y'      : (_s, _d) => (commands.value as EditorCommands<typeof defaultCommands>)?.redo() ?? false,
        'Mod-Shift-z': (_s, _d) => (commands.value as EditorCommands<typeof defaultCommands>)?.redo() ?? false,
        'Mod-b'      : (_s, _d) => (commands.value as EditorCommands<typeof defaultCommands>)?.bold() ?? false,
        'Mod-i'      : (_s, _d) => (commands.value as EditorCommands<typeof defaultCommands>)?.italic() ?? false,
      }),
      keymap(baseKeymap), // 默认键盘命令映射
    ]
  }

  /**
   * 挂载编辑器
   * @param el 容器元素
   */
  function mount(el: HTMLElement) {
    // 如果有初始内容，则解析为 doc
    const doc = content ? parse.parse(content) : undefined

    // 合并插件
    const allPlugins = ([] as Plugin[])
      .concat(plugins ?? [])                // 自定义插件
      .concat(useDefaultPlugins ? createDefaultPlugins() : []) // 默认插件（可选）

    // 创建 EditorState
    const state = EditorState.create({
      doc,
      schema : currentSchema,
      plugins: allPlugins,
    })

    // 创建 EditorView
    view.value = new EditorView(el, {
      state,
      editable: () => toValue(editable),
      dispatchTransaction(transaction) {
        if (!view.value)
          return
        // 应用事务生成新 state
        const newState = view.value.state.apply(transaction)
        view.value.updateState(newState)

        // 更新回调，将 ProseMirror 文档序列化回 Markdown
        if (onChange) {
          const markdown = serializer.serialize(newState.doc)
          onChange(markdown)
        }
      },
      handleDOMEvents: {
        blur: (view, event) => {
          // 获取最新的content

          if (onBlur) {
            const markdown = serializer.serialize(view.state.doc)
            onBlur(markdown, event)
          }
        },

        focus: (_view, event) => {
          if (onFocus) {
            onFocus(event)
          }
        },
      },
    })

    // 初始化命令集合
    commands.value = createCommands(view.value, commandsDesc ?? defaultCommands)
  }

  /** 销毁编辑器实例 */
  function destroy() {
    if (view.value) {
      view.value.destroy()
      view.value = undefined
    }
    commands.value = undefined
  }

  // Vue 生命周期钩子，组件卸载时自动销毁编辑器
  onBeforeUnmount(() => destroy())

  return {
    view,                  // EditorView 实例
    commands,              // 编辑器命令集合
    mount,                 // 挂载编辑器
    destroy,               // 销毁编辑器
    setContent,            // 设置内容
    createDefaultPlugins,  // 获取默认插件
  }
}

/** 编辑器预设类型 */
interface MarkdownPreset {
  schema    : Schema                 // ProseMirror schema
  parse     : MarkdownParser         // Markdown → ProseMirror
  serializer: MarkdownSerializer     // ProseMirror → Markdown
}

/** 编辑器选项类型 */
interface MarkdownEditorOptions<T extends readonly ProsemirrorCommandDesc[] = typeof defaultCommands> {
  preset?           : MarkdownPreset
  plugins?          : Plugin[]
  /**
   * 是否使用默认插件，默认包含 history、baseKeymap 和常用快捷键
   * - 若 plugins 也有值，则会合并两者
   * 默认值: true
   */
  useDefaultPlugins?: boolean
  content?          : string                   // 初始 Markdown 内容
  commandsDesc?     : T                        // 自定义命令描述
  /**
   * 标记是否可以编辑
   */
  editable?         : boolean | Ref<boolean>

  onChange?: (content: string) => void // 内容更新回调
  onBlur?  : (content: string, event: FocusEvent) => void
  onFocus? : (event: FocusEvent) => void
}
