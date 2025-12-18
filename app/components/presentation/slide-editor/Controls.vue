<script setup lang="ts">
import type { PresentationSlide } from '~/types/presentation'

const props = defineProps<{
  slide: PresentationSlide
}>()
</script>

<template>
  <div class="">
    <slot />
  </div>
</template>

<style scoped lang="less">

</style>
