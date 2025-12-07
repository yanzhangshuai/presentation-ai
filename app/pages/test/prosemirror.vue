<script setup lang="ts">
import type { NodeView } from 'prosemirror-view'
import type { Node, Schema } from 'prosemirror-model'

import { keymap } from 'prosemirror-keymap'
import applyDevTools from 'prosemirror-dev-tools'
import { schema } from 'prosemirror-schema-basic'
import { DOMParser, Slice } from 'prosemirror-model'
import { history, redo, undo } from 'prosemirror-history'
import { baseKeymap, toggleMark } from 'prosemirror-commands'
import { ReplaceStep, Transform } from 'prosemirror-transform'
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view'

import { Toolbar } from './prosemirror/toolbar'
import { CustomSchema } from './prosemirror/custom-schema'

definePageMeta({
  ssr: false,
})

const container = useTemplateRef<HTMLDivElement>('container')

const doc = ref<Node>()
const editorView = ref<EditorView>()

let editor: EditorView
let toolbar: Toolbar
// const onStepsTest = () => {
//   if (doc.value) {
//     console.log('current doc', editorView.value?.state.doc.toString())

//     const step = new ReplaceStep(1, 5, Slice.empty)

//     const map = step.getMap()
//     console.log(map.map(8)) // → 6，直接输出翻译结果，不要添加任何额外文本。记住，保留所有HTML标签和属性，只翻译内容！
//     console.log(map.map(2)) // → 2（在更改之前没有任何变化）
//     console.log(map.map(6)) // → 3
//     console.log(map)

//     const res = step.apply(editorView.value!.state.doc)

//     console.log('after step', res.doc?.toString())
//   }
//   else {
//     console.log('Document is not initialized yet.')
//   }
// }

const insertParagraph = (editorView: EditorView, content: string) => {
  const  view = editorView

  if (!view)
    return

  const { state } = view

  const p = state.schema.node(
    'paragraph',
    null,
    state.schema.text(content),
  )

  view.dispatch(
    view.state.tr.insert(view.state.selection.to, p),
  )
}

const insertHeading = (editorView: EditorView, level: number, content: string) => {
  const  view = editorView

  if (!view)
    return

  const { state } = view

  const h = state.schema.node(
    `heading`,
    { level },
    state.schema.text(content),
  )

  view.dispatch(
    view.state.tr.insert(view.state.selection.to, h),
  )
}

function insertDatetime(editorView: EditorView, timestamp: number) {
  const { state, dispatch } = editorView
  const schema = state.schema as Schema

  const jsonContent = {
    type : 'datetime',
    attrs: {
      timestamp: timestamp || Date.now(),
    },
  }

  const node = schema.nodeFromJSON(jsonContent)
  console.log('jsonContent', jsonContent, node)
  const tr = state.tr.replaceWith(state.selection.from, state.selection.to, node)
  dispatch(tr)
}

// const onTransformsTest = () => {
//   console.log('current doc size', editorView.value?.state.doc.toString())
//   const tr = new Transform(editorView.value!.state.doc)

//   tr.split(10)    // 拆分一个节点，+2 个标记在 10
//   tr.split(10)    // 拆分一个节点，+2 个标记在 10
//   tr.delete(2, 5) // -3 tokens at 2，直接输出翻译结果，不要添加任何额外文本。记住，保留所有HTML标签和属性，只翻译内容！
//   console.log(tr.mapping.map(6))  // → 3，直接输出翻译结果，不要添加任何额外文本。记住，保留所有HTML标签和属性，只翻译内容！
//   console.log(tr.mapping.map(10)) // → 9，直接输出翻译结果，不要添加任何额外文本。记住，保留所有HTML标签和属性，只翻译内容！
//   console.log(tr.mapping.map(10, -1)) // → 9，直接输出翻译结果，不要添加任何额外文本。记住，保留所有HTML标签和属性，只翻译内容！
//   console.log(tr.mapping.map(11, -1)) // → 14，直接输出翻译结果，不要添加任何额外的文本。记住，保留所有HTML标签和属性，只翻译内容！
//   console.log('after transform doc size', tr.doc.toString())
// }

// const onTransactionsTest = () => {
//   console.log('current doc size', editorView.value?.state.doc.toString())
//   const tr = editorView.value!.state.tr
//   console.log('Initial transaction:', tr.selection.from)
//   tr.insertText('Hello', 6, 5) // 在位置 1 插入 'Hello'，替换位置 1 到 5 的内容
//   console.log('Initial transaction:', tr.selection.from)
//   const newState = editorView.value!.state.apply(tr)

//   // 更新编辑器视图的状态
//   editorView.value!.updateState(newState)
// }

onMounted(() => {
  // class ParagraphView implements NodeView {
  //   dom       : HTMLElement
  //   contentDOM: HTMLElement
  //   constructor(node: Node) {
  //     this.dom = this.contentDOM = document.createElement('p')
  //     if (node.content.size === 0)
  //       this.dom.classList.add('empty')
  //   }

  //   update(node: Node) {
  //     console.log('ParagraphView update called with node:', node)
  //     if (node.content.size > 0)
  //       this.dom.classList.remove('empty')
  //     else this.dom.classList.add('empty')
  //     return true
  //   }
  // }
  if (toValue(container)) {
    const div = document.createElement('div')
    const state = EditorState.create({
      // doc: DOMParser.fromSchema(CustomSchema).parse(
      //   div,
      // ),
      // doc: DOMParser.fromSchema(schema).parse(
      //   document.querySelector('#__nuxt')!,
      // ),
      schema : CustomSchema,
      plugins: [
        history(),
        keymap(baseKeymap),
        keymap({
          'Mod-z'      : undo,
          'Mod-y'      : redo,
          'Mod-Shift-z': redo,
          'Mod-b'      : (state, dispatch) => {
            console.log('Toggling bold mark', state.schema.marks)
            const strongMark = state.schema.marks.strong
            if (!strongMark)
              return false
            return toggleMark(strongMark)(state, dispatch)
          },
          'Mod-i': (state, dispatch) => {
            const emMark = state.schema.marks.em
            if (!emMark)
              return false
            return toggleMark(emMark)(state, dispatch)
          },
        }),

        new Plugin({
          key : new PluginKey('toolbarPlugin'),
          view: view =>  new Toolbar(view, {
            groups: [
              {
                name : '段落',
                menus: [
                  {
                    label  : '添加段落',
                    handler: (props) => {
                      const { view } = props
                      insertParagraph(view, '新段落')
                    },
                  },
                  {
                    label  : '添加一级标题',
                    handler: (props) => {
                      insertHeading(props.view, 1, '新一级标题')
                    },
                  },
                  // {
                  //   label  : '添加 blockquote',
                  //   handler: (props) => {
                  //     insertBlockquote(props.view)
                  //   },
                  // },
                  {
                    label  : '添加 datetime',
                    handler: (props) => {
                      insertDatetime(props.view, Date.now())
                    },
                  },
                  {
                    label  : '加粗',
                    handler: (props) => {
                      const { state, dispatch } = props.view
                      const { schema, selection } = state

                      if (!state.schema.marks.strong) {
                        return
                      }

                      // 判断当前选区是否已经有 strong mark
                      const hasStrong = state.doc.rangeHasMark(selection.from, selection.to, state.schema.marks.strong)
                      if (hasStrong) {
                        // 如果有，则移除 strong mark
                        props.view.dispatch(
                          state.tr.removeMark(selection.from, selection.to, state.schema.marks.strong),
                        )
                      }
                      else {
                        props.view.dispatch(
                          state.tr.addMark(selection.from, selection.to, state.schema.marks.strong.create()),
                        )
                      }

                      props.view.state.tr.doc.nodesBetween(props.view.state.selection.from,  props.view.state.selection.to, (node, pos) => {
                        console.log('Node between selection:', node.isInline, 'at position',  state.schema.marks.strong?.isInSet(node.marks))
                      })
                    },
                  },
                ],
              },
            ],
          }),

        }),
      ],

    })

    console.log('state.schema:--------', state.schema.node('paragraph').toJSON())
    console.log('state.schema:--------', state.schema.text('text').toJSON())

    // console.log('Initial EditorState created:', state.selection.from, state.selection.to)

    const view = new EditorView(
      toValue(container)!,
      {
        state,
        dispatchTransaction(transaction) {
          // console.log('Document size went from', transaction.before.content.size,                'to', transaction.doc.content, transaction)
          const newState = view.state.apply(transaction)
          view.updateState(newState)

          // toolbar?.update(view, newState)

          console.log(newState.selection)
        },
        nodeViews: {
          // text(node, view, getPos) {
          //   console.log('Custom nodeView for text node:', node, getPos())
          //   return { dom: document.createTextNode(node.text || '') }
          // },
          // paragraph(node) { return new ParagraphView(node) },
        },
        decorations(state) {
          const decoration = Decoration.inline(5, 10, { style: 'color: red' })
          // 返回的 decoration 必须是个 DecorationSet
          return DecorationSet.create(state.doc, [decoration])
        },
      },

    )

    // toolbar =
    editorView.value = view
    editor = view

    applyDevTools(view)

    // watch(
    //   doc,
    //   (newDoc) => {
    //     console.log('Document updated:', newDoc)
    //   },
    //   { deep: true },
    // )

    doc.value = state.doc

    console.log('ProseMirror EditorView initialized:', view)
  }
})
</script>

<template>
  <div>
    <!-- <UButton @click="onStepsTest">
      Test Steps
    </UButton> -->
    <!--
    <UButton @click="onTransformsTest">
      Test Transforms
    </UButton>

    <UButton @click="onTransactionsTest">
      Test Transactions
    </UButton> -->

    <UButton @click="insertParagraph(editor!, '测试')">
      添加P
    </UButton>
    <UButton @click="insertHeading(editor!, 1, '测试H1')">
      添加H1
    </UButton>
    <UButton @click="insertHeading(editor!, 2, '测试H2')">
      添加H2
    </UButton>
    <UButton @click="insertDatetime(editor!, Date.now())">
      添加Date
    </UButton>
  </div>
  <div ref="container" class="prosemirror-editor h-[500px] border border-gray-300 rounded p-4 overflow-auto">
    <!-- ProseMirror editor will be initialized here -->
  </div>
</template>

<style scoped lang="less"></style>
