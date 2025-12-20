<script setup lang="ts">
import { uniqueId } from 'lodash'
import { nextTick, ref, watch } from 'vue'
import { VueDraggableNext as Draggable } from 'vue-draggable-next'

import OutlineItem from './outline-item/Index.vue'
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

const items = ref<{ id: string, content: string }[]>([])
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

    items.value = val.map((content, index) => ({
      // 尽量复用已有 id，避免拖拽 / 编辑器重建
      id: items.value[index]?.id ?? uniqueId('outline_'),

      // content 如果包含 # \n - 则使用原内容，否则使用默认内容， 解决生成时 outline 跳动问题
      content: /[#\n-]/.test(content) ? content : '# \n -',
    }))
  },
  { immediate: true },
)

/* ---------------- 内部 → 外部 ---------------- */

const syncOutline = () => {
  syncingFromItems.value = true
  outline.value = items.value.map(i => i.content)

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
    id     : uniqueId('outline_'),
    content: '# \n - ',
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
    :scroll="true"
    :scroll-sensitivity="80"
    :scroll-speed="20"
    :force-fallback="true"
    :animation="200"
    @start="onDragStart"
    @end="onDragEnd"
  >
    <OutlineItem
      v-for="(item, idx) in items"
      :id="item.id"
      :key="item.id"
      v-model:value="item.content"
      :index="idx"
      :editable="editable"
      :is-generating="isGenerating"
      @delete="id => items = items.filter(i => i.id !== id)"
    />
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
      {{ items.reduce((acc, item) => acc + item.content.length, 0) }}/20000
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
