import type { Transaction } from 'prosemirror-state'

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

export interface TargetDecorationOptions {
  className?   : string
  attributes?  : Record<string, string>
  allowedTypes?: string[]
}

interface PluginState {
  activePosition: number | null
  decorationSet : DecorationSet
}

const name = 'targetDecoration'

const pluginKey = new PluginKey<PluginState>(name)
// ✅ 创建并导出 PluginKey（确保全局唯一）

export const TargetDecoration = Extension.create<TargetDecorationOptions>({
  name,
  addOptions() {
    return {
      className   : 'target-node',
      attributes  : {},
      allowedTypes: undefined,
    }
  },

  /**
   * ✅ 每个实例创建自己的 pluginKey
   */
  addStorage() {
    return {
      name,
      pluginKey,
      pos: null,
    }
  },

  addProseMirrorPlugins() {
    const pluginKey = this.storage.pluginKey

    return [
      new Plugin<PluginState>({
        key: pluginKey,

        state: {
          init: () => {
            return {
              activePosition: null,
              decorationSet : DecorationSet.empty,
            }
          },

          apply: (tr: Transaction, oldState: PluginState) => {
            // ✅ 使用导出的 pluginKey 获取 meta
            const meta = tr.getMeta(pluginKey)

            this.storage.pos = meta?.position ?? oldState.activePosition
            // 1. 接收外部设置的装饰器位置
            if (meta && 'position' in meta) {
              const newPosition = meta.position as number | null

              // 清除装饰器
              if (newPosition === null || newPosition < 0) {
                return { activePosition: null, decorationSet: DecorationSet.empty }
              }

              // 创建新装饰器
              const { doc } = tr
              const node = doc.nodeAt(newPosition)

              if (!node) {
                return { activePosition: null, decorationSet: DecorationSet.empty }
              }

              // 类型检查
              if (this.options.allowedTypes && !this.options.allowedTypes.includes(node.type.name)) {
                return { activePosition: null, decorationSet: DecorationSet.empty }
              }

              const decoration = Decoration.node(
                newPosition,
                newPosition + node.nodeSize,
                {
                  'class'               : this.options.className,
                  ...this.options.attributes,
                  'data-target-position': newPosition.toString(),
                },
              )

              return {
                activePosition: newPosition,
                decorationSet : DecorationSet.create(doc, [decoration]),
              }
            }

            // 2. 文档变化时更新装饰器位置
            if (oldState.activePosition !== null && tr.docChanged) {
              const mappedPosition = tr.mapping.map(oldState.activePosition, -1)

              // 映射后位置无效，清除装饰器
              if (mappedPosition < 0 || mappedPosition >= tr.doc.content.size) {
                return { activePosition: null, decorationSet: DecorationSet.empty }
              }

              const node = tr.doc.nodeAt(mappedPosition)
              if (!node) {
                return { activePosition: null, decorationSet: DecorationSet.empty }
              }

              // 类型检查
              if (this.options.allowedTypes && !this.options.allowedTypes.includes(node.type.name)) {
                return { activePosition: null, decorationSet: DecorationSet.empty }
              }

              const decoration = Decoration.node(
                mappedPosition,
                mappedPosition + node.nodeSize,
                {
                  'class'               : this.options.className,
                  ...this.options.attributes,
                  'data-target-position': mappedPosition.toString(),
                },
              )

              return {
                activePosition: mappedPosition,
                decorationSet : DecorationSet.create(tr.doc, [decoration]),
              }
            }

            return oldState
          },
        },

        props: {
          decorations: (state) => {
            const decorationSet = pluginKey.getState(state)?.decorationSet || DecorationSet.empty
            return decorationSet
          },
        },
      }),
    ]
  },
})
