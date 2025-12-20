<script setup lang="ts">
import type { PresentationSlide } from '~/types/presentation'

const props = defineProps<{
  slide: PresentationSlide
}>()
</script>

<template>
  <slot />

  <div class="absolute top-1 z-10">
    <!-- 在此处添加控件按钮 -->
    <!-- <button class="btn btn-sm btn-primary mr-2">编辑内容</button>
    <button class="btn btn-sm btn-secondary mr-2">更改布局</button>
    <button class="btn btn-sm btn-accent">更改样式</button> -->
  </div>
</template>

<style scoped lang="less">

</style>
