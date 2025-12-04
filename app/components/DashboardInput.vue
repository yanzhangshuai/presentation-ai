<script setup lang="ts">
const emit = defineEmits<{
  (e: 'generate'): void
}>()

// 输入内容
const prompt = defineModel<string>()

// 网络搜索开关
const webSearchModel = defineModel('web', { default: false })

// 固定 id 避免硬编码
const WEB_SEARCH_TOGGLE_ID = 'web-search-toggle'

// 输入提示（使用 computed 更清晰）
const inputKeyTips = computed(() =>
  $t('dashboard.keyGenerateTip', {
    key1: `<kbd class="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">Ctrl</kbd>`,
    key2: `<kbd class="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">Enter</kbd>`,
  }),
)
</script>

<template>
  <div class="relative">
    <!-- 输入框 -->
    <UTextarea
      v-model="prompt"
      :rows="8"
      autoresize
      class="w-full"
      :placeholder="$t('dashboard.inputPlaceholder')"
      @keydown.ctrl.enter="emit('generate')"
    />

    <!-- 底部操作区 -->
    <div class="absolute bottom-3 inset-x-3 z-10 flex justify-between items-end">
      <!-- 输入提示 -->
      <p class="text-xs text-muted-foreground" v-html="inputKeyTips" />

      <!-- 网络搜索 -->
      <div
        class="flex items-center gap-2.5 rounded-full bg-background/95 backdrop-blur-sm px-3.5 py-2
               border border-border shadow-sm hover:shadow-md transition-all"
      >
        <UIcon
          name="i-lucide-globe"
          class="text-base transition-colors"
          :class="webSearchModel ? 'text-primary' : 'text-gray-300 dark:text-gray-600'"
        />

        <label
          :for="WEB_SEARCH_TOGGLE_ID"
          class="text-xs font-medium leading-none cursor-pointer select-none text-foreground"
        >
          {{ $t('dashboard.webSearch') }}
        </label>

        <USwitch
          :id="WEB_SEARCH_TOGGLE_ID"
          v-model="webSearchModel"
          class="cursor-pointer"
        />
      </div>
    </div>
  </div>
</template>
