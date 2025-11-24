<script setup lang="ts">
const createStore = usePresentationCreate()

// 页数选项
const slides =  [1, 5, 10, 15, 20, 25, 30, 40, 50].map((n) => {
  return {
    label: $t('dashboard.slides', { number: n }),
    value: n,
  }
})

const languages = Object.keys(createLanguageMap).map((key) => {
  return {
    label: createLanguageMap[key as keyof typeof createLanguageMap],
    value: key,
  }
})

const pageStyles = [
  { label: 'Default', value: 'default' },
  { label: 'Traditional', value: 'traditional' },
  { label: 'Tall', value: 'tall' },
]
</script>

<template>
  <div class="flex flex-col gap-6 sm:flex-row sm:justify-between">
    <div class="space-y-1.5 flex-1 overflow-hidden">
      <p class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('dashboard.textModel') }}</p>
      <ModelPicker v-model:provider="createStore.modelProvider" v-model:model-id="createStore.modelId" class="w-full" />
    </div>

    <div class="space-y-1.5 flex-1 overflow-hidden">
      <p class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('dashboard.numberOfCards') }}</p>
      <USelect v-model="createStore.numSlides" :items="slides" class="w-full" />
    </div>

    <div class="space-y-1.5 flex-1 overflow-hidden">
      <p class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('common.language') }}</p>
      <USelect v-model="createStore.language" :items="languages" class="w-full" />
    </div>

    <div class="space-y-1.5 flex-1 overflow-hidden">
      <p class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('dashboard.pageStyle') }}</p>
      <USelect v-model="createStore.pageStyle" :items="pageStyles" icon="i-lucide-layout" class="w-full" />
    </div>
  </div>
</template>

<style scoped lang="less">

</style>
