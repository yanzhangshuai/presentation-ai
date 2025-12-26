<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'

import { IMAGE_MODEL_SUPPORTS } from '~~/shared/constansts/ai'

const emit = defineEmits<{
  change: [imageSource: 'ai' | 'stock', imageProvider: ImageModelProvider]
}>()

const imageSource = defineModel<ImageSource>('imageSource', {
  required: false,
  default : 'ai',
})

const imageProvider = defineModel<string |  null>('imageProvider', {
  required: false,
  default : null,
})

const imageModelId = defineModel<string | null>('imageModelId', {
  required: false,
  default : null,
})

const items = ref<SelectItem[]>([
  {
    type : 'label',
    label: $t('presentation.imageSource.ai'),
    icon : 'i-lucide-wand-sparkles',
  },
  ...IMAGE_MODEL_SUPPORTS.map<SelectItem[]>((m) => {
    const models =  m.models.map(model => ({
      label: model.name ? `${m.name} - ${model.name}` : m.name,
      value: `ai|${m.provider}|${model.modelId}`,
      icon : 'i-lucide-bot',
    }))
    return models
  }).flat(),
  {
    type: 'separator',
  },
  {
    type : 'label',
    label: $t('presentation.imageSource.stock'),
  },
  {
    label: 'Unsplash',
    value: 'stock|unsplash|default',
    icon : 'i-lucide-image',
  },
])

const value = computed<string>({
  get: () => {
    return [imageSource.value, imageProvider.value, imageModelId.value]
      .join('|')
  },
  set: (val: string) => {
    const parts = val.split('|')
    imageSource.value = parts?.[0] as ImageSource || 'ai'
    imageProvider.value = parts?.[1] || null
    imageModelId.value = parts[2] || null
  },
})

const onChange = () => {

}
</script>

<template>
  <USelect
    v-model="value"
    size="xl"
    :items="items"
    item-value="value"
    item-label="label"
    class="w-full"
    @change="onChange"
  />
</template>
