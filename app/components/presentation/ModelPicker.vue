<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'

import { TEXT_MODEL_SUPPORTS } from '#shared/constansts/ai'
/* ------------------ Model 定义 ------------------ */
// Model 提供商
const provider = defineModel<ModelProvider>('provider', { default: 'deepseek' })
const modelId  = defineModel<string>('modelId', { default: 'deepseek-chat' })

/** 组合值，USelect 双向绑定 */
const value = computed<string>({
  get: () => `${provider.value}|${modelId.value}`,
  set: (val: string) => {
    const [p, m] = val.split('|')
    if (p)
      provider.value = p as ModelProvider
    if (m)
      modelId.value = m
  },
})

/** 构建下拉选项 */
const items = TEXT_MODEL_SUPPORTS.map<SelectItem[]>((m) => {
  const models =  m.models.map(model => ({
    label: `${model.name}`,
    value: `${m.provider}|${model.modelId}`,
    icon : 'i-lucide-bot',
  }))

  return [
    {
      type : 'label',
      label: m.name,
      value: '',
      icon : 'i-lucide-archive',
    },
    ...models,
  ]
}).flatMap<SelectItem>((item, index) => {
  if (index === item.length - 1)
    return item
  return [...item, { type: 'separator' }]
})

/** 选中的下拉项 */
const selected = computed<SelectItem>(() => {
  // @ts-expect-error 类型推断有误
  return  items.find(item => item!.value === value.value)!
})
</script>

<template>
  <USelect
    v-model="value"
    :items="items"
    icon="i-lucide-bot"
    class="w-full"
  />
</template>
