<script setup lang="ts">
import { modelSupports } from '#shared/constansts/ai'
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
const items = modelSupports.map(m => ({
  label: m.name,
  value: `${m.provider}|${m.modelId}`,
  icon : 'i-lucide-bot',
}))

/** 选中的下拉项 */
const selected = computed(() => items.find(item => item.value === value.value)!)
</script>

<template>
  <USelect
    v-model="value"
    :items="items"
    :icon="selected.icon"
    class="w-full"
  />
</template>
