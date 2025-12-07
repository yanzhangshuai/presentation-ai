<script setup lang="ts">
/* ------------------ Props ------------------ */
const { showLabel = true } = defineProps<{
  showLabel?: boolean
}>()

/* ------------------ Model 定义 ------------------ */
const numSlides = defineModel<number>('numSlides')
const language = defineModel<LanguageSupport>('language')
const modelProvider = defineModel<ModelProvider>('modelProvider')
const modelId = defineModel<string>('modelId')
const pageStyle = defineModel<string>('pageStyle')

/* ------------------ 下拉选项 ------------------ */

/** 页数选项 */
const slides = [1, 5, 10, 15, 20, 25, 30, 40, 50].map((n) => {
  return {
    label: $t('dashboard.slides', { number: n }),
    value: n,
  }
})

/** 语言选项 */
const languages = Object.keys(createLanguageMap).map((key) => {
  return {
    label: createLanguageMap[key as LanguageSupport],
    value: key,
  }
})

/** 页面样式选项 */
const pageStyles = [
  { label: 'Default', value: 'default' },
  { label: 'Traditional', value: 'traditional' },
  { label: 'Tall', value: 'tall' },
]
</script>

<template>
  <div class="flex flex-col gap-6 sm:flex-row sm:justify-between">
    <div class="space-y-1.5 flex-1 overflow-hidden">
      <p v-if="showLabel" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{
          $t('dashboard.textModel') }}
      </p>
      <PresentationModelPicker v-model:provider="modelProvider" v-model:model-id="modelId" class="w-full" />
    </div>

    <div class="space-y-1.5 flex-1 overflow-hidden">
      <p v-if="showLabel" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{
          $t('dashboard.numberOfCards') }}
      </p>
      <USelect v-model="numSlides" :items="slides" class="w-full" />
    </div>

    <div class="space-y-1.5 flex-1 overflow-hidden">
      <p v-if="showLabel" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{
          $t('common.language') }}
      </p>
      <USelect v-model="language" :items="languages" class="w-full" />
    </div>

    <div class="space-y-1.5 flex-1 overflow-hidden">
      <p v-if="showLabel" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{
          $t('dashboard.pageStyle') }}
      </p>
      <USelect v-model="pageStyle" :items="pageStyles" icon="i-lucide-layout" class="w-full" />
    </div>
  </div>
</template>
