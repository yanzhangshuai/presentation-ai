<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import type { Editor } from '@tiptap/vue-3'

const props = defineProps<{
  editor: Editor
}>()

const items:Array<SelectItem> = [
  {
    icon : 'i-lucide-pilcrow',
    label: 'Text',
    value: 'paragraph',
  },
  {
    type: 'separator',
  },
  {
    icon : 'i-lucide-heading-1',
    label: 'Heading 1',
    value: 'heading-1',
  },
  {
    icon : 'i-lucide-heading-2',
    label: 'Heading 2',
    value: 'heading-2',
  },
  {
    icon : 'i-lucide-heading-3',
    label: 'Heading 3',
    value: 'heading-3',
  },
  {
    icon : 'i-lucide-heading-4',
    label: 'Heading 4',
    value: 'heading-4',
  },
  {
    icon : 'i-lucide-heading-5',
    label: 'Heading 5',
    value: 'heading-5',
  },
  {
    icon : 'i-lucide-heading-6',
    label: 'Heading 6',
    value: 'heading-6',
  },
  {
    type: 'separator',
  },
  {
    icon : 'i-lucide-list',
    label: 'Bulleted List',
    value: 'bulleted_list',
  },
  // {
  //   icon : 'i-lucide-list-numbers',
  //   label: 'Numbered List',
  //   value: 'ordered_list',
  // },
]

const current = computed<string | null>(() => {
  const { editor } =  props
  if (!editor)
    return null

  const { state } = editor
  const { selection } = state
  const { $from, $to } = selection
  const node = state.doc.nodeAt($from.pos)
  console.log('node-select current node:', node)
  if (!node)
    return null

  if (node.type.name === 'paragraph')
    return 'paragraph'
  if (node.type.name === 'heading')
    return `heading-${node.attrs.level}`
  if (node.type.name === 'bullet_list')
    return 'bulleted_list'
  if (node.type.name === 'ordered_list')
    return 'ordered_list'

  return null
})

const onChange = (evt: Event) => {
  const target = evt.target as HTMLSelectElement
  const value = target.value

  switch (value) {
    case 'paragraph':
      props.editor.chain().focus().setParagraph().run()
      break
    case 'heading-1':
      props.editor.chain().focus().toggleHeading({ level: 1 }).run()
      break
    case 'heading-2':
      props.editor.chain().focus().toggleHeading({ level: 2 }).run()
      break
    case 'heading-3':
      props.editor.chain().focus().toggleHeading({ level: 3 }).run()
      break
    case 'heading-4':
      props.editor.chain().focus().toggleHeading({ level: 4 }).run()
      break
    case 'heading-5':
      props.editor.chain().focus().toggleHeading({ level: 5 }).run()
      break
    case 'heading-6':
      props.editor.chain().focus().toggleHeading({ level: 6 }).run()
      break
      // case 'bulleted_list':
      //   props.editor.chain().focus().toggleBulletList().run()
      break
    case 'ordered_list':
      props.editor.chain().focus().toggleOrderedList().run()
      break
  }
}
</script>

<template>
  <USelect :model-value="current" :items="items" @change="onChange" />
</template>

<style scoped lang="less">

</style>
