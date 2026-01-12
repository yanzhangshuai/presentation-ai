<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    id           : string
    index        : number
    editable?    : boolean
    isGenerating?: boolean
  }>(),
  {
    editable: true,
  },
)

defineEmits<{
  delete: [id: string]
}>()

const content = defineModel<string>('value')
</script>

<template>
  <li class="group flex items-center gap-4 rounded-md p-4 space-y-2 mb-2 relative bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700">
    <!-- 拖拽手柄 -->
    <UIcon
      name="i-lucide-grip-vertical"
      class="drag-handle text-xl text-muted-foreground"
      :class="isGenerating ? 'cursor-not-allowed' : 'cursor-move'"
    />

    <!-- 序号 -->
    <span class="text-indigo-400 font-mono">{{ index + 1 }}</span>

    <!-- 编辑器主体 -->
    <LazyOutlineEditor
      v-model:value="content"
      class="flex-1"
      :editable="editable"
    />

    <!-- 删除按钮 -->
    <UIcon
      v-if="editable"
      name="i-lucide-x"
      class="cursor-pointer text-2xl text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
      @click="$emit('delete', id)"
    />
  </li>
</template>
