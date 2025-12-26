import type { Node } from 'prosemirror-model'
import type { EditorView, NodeView } from 'prosemirror-view'

import { Plugin } from 'prosemirror-state'
import { cva } from 'class-variance-authority'

// 定义不同级别 h1~h6 的样式
const headingVariants = cva('relative mb-1', {
  variants: {
    level: {
      h1: 'pb-1 text-5xl font-bold',
      h2: 'pb-px text-3xl font-semibold tracking-tight',
      h3: 'pb-px text-2xl font-semibold tracking-tight',
      h4: 'text-xl font-semibold tracking-tight',
      h5: 'text-lg font-semibold tracking-tight',
      h6: 'text-base font-semibold tracking-tight',
    },
  },
})

class HeadingView implements NodeView {
  dom       : HTMLElement
  contentDOM: HTMLElement
  node      : Node

  constructor(
    node: Node,
    view: EditorView,
    getPos: () => number | undefined,
  ) {
    this.node = node

    // 外层 hX 容器
    const levelName = `h${node.attrs.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    const dom = document.createElement(levelName)
    dom.className = cn('presentation-heading', headingVariants({ level: levelName }))

    // 内层 span 作为可编辑区 (contentDOM)
    const contentDOM = document.createElement('span')
    // ProseMirror 会自动把节点的 child 内容渲染到这里
    dom.appendChild(contentDOM)

    // 点击事件示例：切换高亮
    dom.addEventListener('click', () => {
      dom.classList.toggle('highlight')
    })

    // 赋值给 NodeView 必需属性
    this.dom = dom
    this.contentDOM = contentDOM
  }

  update(node: Node): boolean {
    // 如果节点类型变了，就不更新
    if (node.type !== this.node.type)
      return false

    this.node = node
    // 可以更新外层的 class（例如 level 改变时）
    const levelName = `h${node.attrs.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    this.dom.className = cn('presentation-heading', headingVariants({ level: levelName }))

    return true
  }
}

export const headingPlugin = new Plugin({
  props: {
    nodeViews: {
      heading: (node, view, getPos) => new HeadingView(node, view, getPos),
    },
  },
})
