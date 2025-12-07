<script setup lang="ts">
import { uniqueId } from 'lodash'
import { nextTick, ref, watch } from 'vue'
import { VueDraggableNext as Draggable } from 'vue-draggable-next'

/* ---------------- props ---------------- */

const { isGenerating = false, totalSlides = 5 } =  defineProps<{
  isGenerating?: boolean
  totalSlides? : number
}>()

/**
 * 对外暴露的最终 Outline
 */
const outline = defineModel<string[]>('outline', {
  default: () => [],
})

/* ---------------- state ---------------- */

const items = ref<{ id: string, title: string }[]>([])
const isDragging = ref(false)

/**
 * 防止「内部同步 → 又触发外部 watch」的锁
 */
const syncingFromItems = ref(false)

/* ---------------- 外部 → 内部 ---------------- */

/**
 * 外部 outline 变化时，重建 items
 */
watch(
  outline,
  (val) => {
    if (syncingFromItems.value)
      return

    items.value = val.map((title, index) => ({
      // 尽量复用已有 id，避免拖拽 / 编辑器重建
      id: items.value[index]?.id ?? uniqueId('outline_'),
      title,
    }))
  },
  { immediate: true },
)

/* ---------------- 内部 → 外部 ---------------- */

const syncOutline = () => {
  syncingFromItems.value = true
  outline.value = items.value.map(i => i.title)

  nextTick(() => {
    syncingFromItems.value = false
  })
}

/**
 * 编辑态同步（非拖拽中）
 */
watch(
  items,
  () => {
    if (!toValue(isDragging))
      syncOutline()
  },
  { deep: true },
)

const editable = computed(() => {
  return !isGenerating && !toValue(isDragging)
})

/* ---------------- actions ---------------- */

const onAddCard = () => {
  items.value.push({
    id   : uniqueId('outline_'),
    title: '# \n - ',
  })
}

/* ---------------- draggable hooks ---------------- */

const onDragStart = () => {
  isDragging.value = true
}

const onDragEnd = () => {
  isDragging.value = false
  syncOutline() // 拖拽完成后一次性同步
}
</script>

<template>
  <div class="space-y-4">
    <!-- 标题 -->
    <div class="flex-between-center">
      <h2 class="text-sm">{{ $t('presentation.outline.title') }}</h2>
      <span v-if="isGenerating" class="animate-pulse text-xs">{{ $t('presentation.outline.generatingLoading') }}</span>
    </div>
  </div>

  <!-- 拖拽列表 -->
  <Draggable
    v-model="items"
    item-key="id"
    :disabled="isGenerating"
    handle=".drag-handle"
    class="space-y-2"
    drag-class="opacity-100"
    tag="transition-group"
    :component-data="{
      tag: 'div',
      type: 'transition',
      name: 'fade',
    }"
    ghost-class="opacity-0"
    :animation="200"
    @start="onDragStart"
    @end="onDragEnd"
  >
    <li
      v-for="(item, idx) in items" :key="item.id" class="
          group flex items-center gap-4 rounded-md p-4 space-y-2 mb-2 relative
        bg-gray-100 hover:bg-gray-200 hover:shadow-md
          dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:hover:shadow-xl
        "
    >
      <!-- drag handle -->
      <UIcon
        name="i-lucide-grip-vertical"
        class="drag-handle text-xl text-muted-foreground hover:text-foreground"
        :class="{
          'cursor-move': !isGenerating,
          'cursor-no-drop': isGenerating,
        }"
      />

      <!-- index -->
      <span class="text-indigo-400">{{ idx + 1 }}</span>

      <!-- editor -->
      <PresentationOutlineContent v-model="item.title" class="flex-1" :editable="editable" />

      <!-- delete -->
      <UIcon
        v-if="editable"
        name="i-lucide-x"
        class="cursor-pointer text-2xl text-muted-foreground opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
        @click="items = items.filter(i => i.id !== item.id)"
      />
    </li>
  </Draggable>

  <!-- skeleton -->
  <USkeleton
    v-for="sk in Math.max(0, totalSlides - items.length)" :key="sk"
    class="h-16 w-full animate-pulse rounded-md bg-muted"
  />

  <UButton
    :disabled="isGenerating" class="
        w-full flex-center gap-2 rounded-md py-3 text-muted-foreground transition-colors cursor-pointer
      bg-gray-100 hover:bg-gray-200
      disabled:bg-gray-100 disabled:text-gray-400
        dark:bg-neutral-800 dark:hover:bg-neutral-700
      dark:disabled:bg-gray-800 dark:disabled:text-gray-500
      " @click="onAddCard"
  >
    <UIcon name="i-lucide-plus" size="20" />
    {{ $t('presentation.outline.addCard') }}
  </UButton>

  <div class="flex-between-center text-sm text-muted-foreground">
    <span>{{ $t('presentation.outline.totalCards', { count: items.length }) }}</span>
    <span>
      {{ items.reduce((acc, item) => acc + item.title.length, 0) }}/20000
    </span>
  </div>
</template>

<style lang="less" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
