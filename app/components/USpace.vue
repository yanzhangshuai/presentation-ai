<script setup lang="ts">
import { cn } from '~/utils'

const props = defineProps({
  direction: { type: String as () => 'horizontal' | 'vertical', default: 'horizontal' },
  size     : { type: [Number, String], default: 8 },
  wrap     : { type: Boolean, default: false },
  class    : { type: String, default: '' },
  style    : { type: Object, default: () => ({}) },
})

const attrs = useAttrs()

// 计算间距
const mergedStyle = computed(() => {
  const gap = typeof props.size === 'number' ? `${props.size}px` : props.size
  return {
    gap,
    ...props.style,
  }
})
</script>

<template>
  <div
    class="aspace" :class="cn(direction === 'vertical' ? 'flex-col' : 'flex-row', wrap && 'flex-wrap', props.class)"
    :style="mergedStyle"
    v-bind="attrs"
  >
    <slot />
  </div>
</template>

<style scoped>
.aspace {
  display: flex;
}
</style>
