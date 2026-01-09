import type { EditorView } from 'prosemirror-view'

import { NodeSelection, Plugin, PluginKey, TextSelection } from 'prosemirror-state'

export interface BubbleMenuState {
  visible: boolean
  from   : number
  to     : number
  type   : 'text' | 'node'
  coords : { top: number, left: number }
}

export interface BubbleMenuContext {
  view     : EditorView
  state    : any
  selection: any
}

export interface BubbleMenuOptions {
  offset?    : number
  shouldShow?: (ctx: BubbleMenuContext) => boolean
}

export const bubbleMenuPluginKey = new PluginKey('bubble-menu')

export function bubbleMenuPlugin(
  onUpdate: (state: BubbleMenuState | null) => void,
  options: BubbleMenuOptions = {},
) {
  const { offset = 8, shouldShow } = options

  return new Plugin({
    key: bubbleMenuPluginKey,
    view(_editorView) {
      return {
        update(view, prevState) {
          const { selection } = view.state
          if (selection.eq(prevState.selection))
            return

          const ctx = { view, state: view.state, selection }

          if (shouldShow && !shouldShow(ctx)) {
            onUpdate(null)
            return
          }

          if (selection.empty) {
            onUpdate(null)
            return
          }

          if (selection instanceof NodeSelection) {
            const start = view.coordsAtPos(selection.from)
            onUpdate({
              visible: true,
              from   : selection.from,
              to     : selection.to,
              type   : 'node',
              coords : { top: start.top - offset, left: start.left },
            })
            return
          }

          if (selection instanceof TextSelection) {
            const start = view.coordsAtPos(selection.from)
            const end = view.coordsAtPos(selection.to)
            onUpdate({
              visible: true,
              from   : selection.from,
              to     : selection.to,
              type   : 'text',
              coords : { top: Math.min(start.top, end.top) - offset, left: (start.left + end.left) / 2 },
            })
          }
        },
      }
    },
  })
}
