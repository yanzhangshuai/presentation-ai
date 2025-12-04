<script setup lang="ts">
const props = defineProps<{
  status      : 'pending' | 'error' | 'success' | 'idle'
  error?      : string
  loadingTitle: string
  loadingText?: string
}>()

const isPending = computed(() => props.status === 'pending')
const isError   = computed(() => props.status === 'error')
const isSuccess = computed(() => props.status === 'success')

// 公共容器样式
const containerClass = 'flex h-[calc(100vh-8rem)] flex-col items-center justify-center'
</script>

<template>
  <!-- Pending -->
  <div v-if="isPending" :class="containerClass">
    <UiSpinner class="h-10 w-10 text-primary" />
    <div class="space-y-2 text-center mt-4">
      <h2 class="text-2xl font-bold">{{ props.loadingTitle }}</h2>
      <p v-if="props.loadingText" class="text-muted-foreground">{{ props.loadingText }}</p>
    </div>
  </div>

  <!-- Error -->
  <div v-else-if="isError" :class="containerClass">
    <UIcon name="i-lucide-circle-x" class="h-10 w-10 text-primary" />
    <div class="space-y-2 text-center mt-4">
      <h2 class="text-2xl font-bold">{{ props.error }}</h2>
    </div>
  </div>

  <!-- Success -->
  <div v-else-if="isSuccess">
    <slot />
  </div>
</template>
