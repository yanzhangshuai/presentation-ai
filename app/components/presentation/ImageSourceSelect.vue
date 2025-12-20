<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'

const current = defineModel<string>({
  required: true,
})

const IMAGE_MODELS: { value: ImageModelSupport, label: string }[] = [
  { value: 'black-forest-labs/FLUX.1-schnell-Free', label: 'FLUX Fast' },
  { value: 'black-forest-labs/FLUX.1-dev', label: 'FLUX Developer' },
  { value: 'black-forest-labs/FLUX1.1-pro', label: 'FLUX Premium' },
]

const IMAGE_STOCK_SOURCES: { value: ImageStockSource, label: string }[] = [
  { value: 'unsplash', label: 'Unsplash' },
]

const items = ref<SelectItem[]>([
  {
    type : 'label',
    label: $t('presentation.imageSource.ai'),
    icon : 'i-lucide-wand-sparkles',
  },
  ...IMAGE_MODELS.map(model => ({
    label: model.label,
    value: `ai_${model.value}`,
  })),
  {
    type: 'separator',
  },
  {
    type : 'label',
    label: $t('presentation.imageSource.stock'),
  },
  ...IMAGE_STOCK_SOURCES.map(source => ({
    label: source.label,
    value: `stock_${source.value}`,
  })),
])
</script>

<template>
  <USelect
    v-model="current"
    size="xl"
    :items="items"
    item-value="value"
    item-label="label"
    class="w-full"
  />
</template>
