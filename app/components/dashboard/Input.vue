<script setup lang="ts">
const emit = defineEmits<{
  (e: 'generate'): void
}>()

const createStore = usePresentationCreate()

const inputKeyTips = $t('dashboard.keyGenerateTip', {
  key1: '<kbd class="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">Ctrl</kbd>',
  key2: '<kbd class="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">Enter</kbd>',
})
</script>

<template>
  <div class="relative">
    <UTextarea
      v-model="createStore.prompt"
      :rows="8"
      autoresize
      class="w-full"
      :placeholder="$t('dashboard.inputPlaceholder')"
      @keydown.ctrl.enter="$emit('generate')"
    />

    <div class="absolute flex-between-center bottom-3 inset-x-3 z-10">
      <p class="text-xs text-muted-foreground" v-html="inputKeyTips" />

      <!-- 网络搜索提示 -->
      <div class="inline-flex items-center gap-2.5 rounded-full bg-background/95 backdrop-blur-sm px-3.5 py-2 shadow-sm border border-border transition-all hover:shadow-md">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-globe" class="text-base transition-colors" :class="createStore.outline ? 'text-primary' : 'text-gray-300 dark:text-gray-600'" />
          <label
            html-for="web-search-toggle"
            class="text-xs font-medium leading-none cursor-pointer select-none text-foreground"
          >
            {{ $t('dashboard.webSearch') }}
          </label>

          <USwitch id="web-search-toggle" v-model="createStore.outline" class="cursor-pointer" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">

</style>
