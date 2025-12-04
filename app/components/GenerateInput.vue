<script setup lang="ts">
/* ------------------ Props ------------------ */
const { disabled = false } = defineProps<{ disabled?: boolean }>()

/* ------------------ Emits ------------------ */
const emit = defineEmits<{
  click: [string]
}>()

/* ------------------ Model 定义 ------------------ */
const value = defineModel<string>({ default: '' })

/** 计算按钮是否可用 */
const isDisabled = computed(() => disabled || !value.value.trim())
</script>

<template>
  <div class="relative">
    <UInput
      v-model="value"
      class="w-full"
      color="neutral"
      size="xl"
      :placeholder="$t('presentation.promptPlaceholder')"
      :disabled="disabled"
    />

    <UButton
      variant="ghost" class="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400"
      :class="{ 'hover:text-indigo-500': !disabled }" :disabled="isDisabled" @click="emit('click', value)"
    >
      <UIcon name="i-lucide-refresh-cw" />
    </UButton>
  </div>
</template>
