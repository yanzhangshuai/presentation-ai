<script setup lang="ts">
interface Props {
  text?: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
})

const segments = 12
const segmentWidth = 2
</script>

<template>
  <div class="flex items-center gap-1">
    <svg
      class="animate-spin"
      viewBox="0 0 50 50"
      :height="props.size"
      :width="props.size"
    >
      <rect
        v-for="(_, index) in segments"
        :key="index"
        x="23.5"
        y="5"
        :width="segmentWidth"
        height="10"
        rx="1"
        ry="1"
        fill="currentColor"
        :transform="`rotate(${index * (360 / segments)} 25 25)`"
        :opacity="1 - (index * 0.75) / segments"
      />
    </svg>

    <span v-if="props.text" class="text-inherit">
      {{ props.text }}
    </span>
  </div>
</template>
