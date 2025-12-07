import type { Schema } from 'prosemirror-model'
import type { EditorView } from 'prosemirror-view'
import type { EditorState } from 'prosemirror-state'

import { keymap } from 'prosemirror-keymap'
import { redo, undo } from 'prosemirror-history'
import { baseKeymap, setBlockType, toggleMark } from 'prosemirror-commands'

/**
 * 命令类型
 * - 'mark' 表示对 mark 进行操作，例如 bold、italic
 * - 'node' 表示对 node 进行操作，例如 code block
 * - 'custom' 表示自定义命令，由用户自行实现 run
 */
export type ProsemirrorCommandType = 'mark' | 'node' | 'custom'

/**
 * 单个命令描述
 * T extends string 用于约束命令 name 的字面量类型，方便 TS 联合类型推导
 */
export type ProsemirrorCommandDesc<Name extends string = string>
  = | {
    /** 对外暴露的命令名称 */
    name     : Name
    /** 命令类型 */
    type     : 'mark' | 'node'
    /** 对应的 schema key（mark 或 node） */
    schemaKey: string
  }
  | {
    /** 命令名称 */
    name: Name
    /** 命令类型 */
    type: 'custom'
    /**
     * 自定义命令实现
     * @param ctx 包含 view, state, dispatch, schema
     * @returns boolean 表示命令是否执行成功
     */
    run : (ctx: CommandContext) => boolean
  }

/**
 * 命令上下文
 * - 包含当前 EditorView、EditorState、dispatch 函数和 Schema
 * - 用于 run 自定义命令或内部执行 mark/node 命令
 */
export interface CommandContext {
  /** ProseMirror 编辑器实例 */
  view    : EditorView
  /** 当前编辑器状态 */
  state   : EditorState
  /** 调度函数，用于执行 transaction */
  dispatch: EditorView['dispatch']
  /** 当前文档 Schema */
  schema  : Schema
}

/**
 * 默认命令集合
 * - 支持常用 mark、node 命令和 undo/redo
 * - 通过 defineCommands 工厂函数定义
 */
export const defaultCommands = defineCommands([
  { name: 'bold', type: 'mark', schemaKey: 'strong' },
  { name: 'italic', type: 'mark', schemaKey: 'em' },
  // { name: 'toggleCodeBlock', type: 'node', schemaKey: 'code_block' },
  {
    name: 'undo',
    type: 'custom',
    run({ state, dispatch }) {
      undo(state, dispatch)
      return true
    },
  },
  {
    name: 'redo',
    type: 'custom',
    run({ state, dispatch }) {
      redo(state, dispatch)
      return true
    },
  },
])

/**
 * EditorCommands 类型映射
 * - 将命令 name 映射为函数
 * - 函数返回 boolean，表示命令是否执行成功
 */
export type EditorCommands<
  T extends readonly ProsemirrorCommandDesc[],
> = {
  [K in T[number]['name']]: () => boolean
}

/**
 * 工厂函数：定义命令集合
 * - 保留字面量类型，方便 TS 联合类型推导
 * - 不执行任何逻辑，仅做类型包装
 * @param value 命令描述数组
 * @returns 原样返回命令数组
 */
export function defineCommands<
  const T extends readonly ProsemirrorCommandDesc[],
>(value: T) {
  // 这里不使用 as const，而是依赖泛型 T + 调用方 satisfies 做 TS 类型推导
  return value satisfies readonly ProsemirrorCommandDesc[]
}

/**
 * 创建命令集合函数
 * - 将 ProseMirror View + 命令描述映射为可执行函数
 * - mark/node 命令会调用 ProseMirror 内置 toggleMark / setBlockType
 * - custom 命令会调用自定义 run 方法
 * - 所有命令返回 boolean，表示执行是否成功
 * @param view 当前 EditorView
 * @param descriptors 命令描述数组，可选，默认为 defaultCommands
 * @returns EditorCommands 对象，可直接调用 commands.value.bold() 等
 */
export function createCommands<
  const T extends readonly ProsemirrorCommandDesc[],
>(
  view: EditorView,
  descriptors?: T,
): EditorCommands<T> {
  // 初始化 commands 对象
  const commands = {} as EditorCommands<T>

  // 如果没有传 descriptors，使用默认命令
  descriptors = descriptors ?? defaultCommands as any

  // 遍历所有命令描述
  for (const desc of descriptors!) {
    // 将命令映射为函数
    commands[desc.name as keyof EditorCommands<T>] = () => {
      let bool = false // 标记命令是否执行成功

      // --- 自定义命令优先 ---
      if (desc.type === 'custom' && desc.run) {
        bool = desc.run({
          view,
          state   : view.state,
          dispatch: view.dispatch,
          schema  : view.state.schema,
        })
        view.focus() // 执行后保持焦点
      }

      // --- mark 命令 ---
      if (desc.type === 'mark' && desc.schemaKey) {
        const mark = view.state.schema.marks[desc.schemaKey]
        if (mark) {
          // toggleMark 返回 boolean | undefined
          bool = toggleMark(mark)(view.state, view.dispatch) ?? false
          view.focus()
        }
      }

      // --- node 命令 ---
      if (desc.type === 'node' && desc.schemaKey) {
        const node = view.state.schema.nodes[desc.schemaKey]
        if (node) {
          // setBlockType 返回 boolean | undefined
          bool = setBlockType(node)(view.state, view.dispatch) ?? false
          view.focus()
        }
      }

      return bool
    }
  }

  return commands
}
