<script setup lang="ts">
const provider = defineModel<ModelProvider>('provider', { default: 'deepseek' })

const modelId = defineModel<string>('modelId', { default: 'deepseek-chat' })

const value = computed({
  get: () => {
    return `${provider.value}|${modelId.value}`
  },
  set: (val: string) => {
    const [p, m] = val.split('|')
    provider.value = p as ModelProvider
    modelId.value = m!
  },
})

const items = modelSupportList.map((m) => {
  return {
    label: m.name,
    value: `${m.provider}|${m.modelId}`,
    icon : 'i-lucide-bot',
  }
})

const selected = computed(() =>
  toValue(items).find(item => item.value === value.value)!,
)
</script>

<template>
  <USelect v-model="value" :items="items" :icon="selected.icon" />
</template>

<style scoped lang="less">

</style>
