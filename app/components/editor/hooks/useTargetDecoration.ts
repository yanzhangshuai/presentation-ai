import type { Editor } from '@tiptap/core'

import type  { TargetDecoration } from '../extensions/targetDecoration'

type TargetDecorationType = typeof TargetDecoration

export function useTargetDecoration(editor: Editor | null) {
  /**
   * ✅ 根据 name 找到对应的 TargetDecoration Extension
   */
  const findExtension = (name: string): TargetDecorationType | null => {
    if (!editor)
      return null

    return (
      editor.extensionManager.extensions.find(
        ext =>
          ext.name
          && ext.name === name,
      ) as TargetDecorationType | undefined
    ) ?? null
  }

  /**
   * ✅ 设置装饰器
   */
  const set = (pos: number | null) => {
    if (!editor) {
      return false
    }

    const ext = findExtension('targetDecoration')

    if (!ext || !ext.storage?.pluginKey) {
      console.error(`❌ TargetDecoration extension not found: ${name}`)
      return false
    }

    const tr = editor.state.tr
    tr.setMeta(ext.storage.pluginKey, { position: pos })
    editor.view.dispatch(tr)

    return true
  }

  /**
   * ✅ 清除指定实例的装饰器
   */
  const clear = () => {
    return set(null)
  }

  /**
   * ✅ 根据节点设置（指定实例）
   */
  const setByNode = (name: string, node: any) => {
    if (!editor || !node) {
      console.error('❌ Editor or node is null')
      return false
    }

    const { doc } = editor.state
    let foundPos = -1

    doc.descendants((child, pos) => {
      if (child === node) {
        foundPos = pos
        return false
      }
      return true
    })

    if (foundPos !== -1) {
      return set(foundPos)
    }

    return false
  }

  const getPos  = () => {
    const ext = findExtension('targetDecoration')
    return ext?.storage?.pos ?? null
  }

  return {
    set,
    clear,
    getPos,
    setByNode,
  }
}
