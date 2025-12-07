import type { EditorView } from 'prosemirror-view'
import type { EditorState, PluginView, Transaction   } from 'prosemirror-state'

// crel 就是个 createElement 的缩写，用来创建 dom 元素的，感兴趣的可以看看源码就几十行
import crel from 'crelt'

// 抽象 menu 的定义，不要每次都定义很多 html
/**
 * const btn = document.createElement('button')
 * btn.classList.add('is-active') // 当前 btn 激活
 * btn.classList.add('is-disabled') // 当前 btn 禁用
 * btn.onClick = fn // 点击 btn 后的效果
 *
 * update btn style
 */

export interface MenuItemSpec {
  class? : string
  label  : string
  handler: (
    props: {
      view    : EditorView
      state   : EditorState
      tr      : Transaction
      dispatch: EditorView['dispatch']
    },
    event: MouseEvent,
  ) => void
  update?: (view: EditorView, state: EditorState, menu: HTMLElement) => void
}

export class MenuItem {
  constructor(private view: EditorView, private spec: MenuItemSpec) {
    // 保存当前实例的 this
    // 创建 button
    const btn = crel('UButton', {
      class  : spec.class,
      // 绑定点击事件，点击按钮时要执行的函数
      onclick: (event: MouseEvent) => {
        // 把 view state 等内容传过去，因为点击按钮的时候不是增加一个node，就是要设置 mark
        spec.handler({
          view    : this.view,
          state   : this.view.state,
          dispatch: this.view.dispatch,
          tr      : this.view.state.tr,
        }, event)
      },
    })

    btn.classList.add('menu-item')

    btn.textContent = spec.label

    // 将 btn 绑定在当前组件上
    this.dom = btn
  }

  dom: HTMLElement

  // 定义一个 update 更新方法，在编辑器有更新的时候就调用
  update(view: EditorView, state: EditorState) {
    this.view = view
    this.spec.update?.(view, state, this.dom)
  }
}

export interface MenuGroupSpec {
  name? : string
  class?: string
  menus : MenuItemSpec[]
}

export class MenuGroup {
  constructor(private view: EditorView, private spec: MenuGroupSpec) {
    // 创建一个 div
    const dom = crel('div', { class: this.spec.class })
    dom.classList.add('menu-group')

    // 将 dom 保存在 MenuGroup 实例属性上
    this.dom = dom
    // 通过传递的 menus 配置项，批量创建 menu
    this.menus = spec.menus.map(menuSpec => new MenuItem(this.view, menuSpec))

    // 最后将 menu 对应的 dom 添加到 menuGroup 的 dom 中
    this.menus.forEach((menu) => {
      dom.appendChild(menu.dom)
    })
  }

  private menus: MenuItem[]

  dom: HTMLElement

  // 定义一个 update, 主要用来批量更新 menu 的 update
  update(view: EditorView, state: EditorState) {
    this.view = view
    this.menus.forEach((menu) => {
      menu.update(view, state)
    })
  }
}

export interface ToolbarSpec {
  groups: MenuGroupSpec[]
  class?: string
}

export class Toolbar implements PluginView {
  constructor(private view: EditorView, private spec: ToolbarSpec) {
    // 定义一个 toolbar dom
    const toolbarDom = crel('div', { spec: this.spec.class })
    toolbarDom.classList.add('toolbar')

    // 将 dom 保存在 Toolbar 实例属性中
    this.dom = toolbarDom

    // 批量创建 menuGroup
    this.groups = this.spec.groups.map(groupSpec => new MenuGroup(this.view, groupSpec))

    // 把 menuGroup 分别加入到 toolbar 中
    this.groups.forEach((group) => {
      this.dom.appendChild(group.dom)
    })

    this.render()
  }

  // 这个 render 比较特殊，我们可以通过 view.dom 获取到 Prosemirror 编辑器挂载的 dom
  // 之后获取到它的父节点，将 toolbar 塞到 编辑器节点的前面去：这里先将 view.dom 替换成 toolbar 再把 view.dom append 上去
  // 你也可以直接用 insertBefore 之类的 api
  render() {
    if (this.view.dom.parentNode) {
      const parentNode = this.view.dom.parentNode
      const editorViewDom = parentNode.replaceChild(this.dom, this.view.dom)
      parentNode.appendChild(editorViewDom)
    }
  }

  groups: MenuGroup[]

  dom: HTMLElement
  // 定义 update,主要用来批量更新 MenuGroup 中的 update
  update(view: EditorView, state: EditorState) {
    this.view = view
    this.groups.forEach((group) => {
      group.update(this.view, state)
    })
  }

  destroy() {
    // 销毁 toolbar dom
    if (this.dom.parentNode) {
      this.dom.parentNode.removeChild(this.dom)
    }
  }
}
