<script setup lang="ts">
const props = defineProps<{
  isGenerating?: boolean
}>()
const presentationStore = usePresentationStore()
const { presentationDoc } = storeToRefs(presentationStore)

// const { editor } = useSlideEditor()
</script>

<template>
  <div class="slide-list">
    <PresentationSlideEditor v-for="(s, index) in presentationDoc.slides" :key="s.id" :slide-id="s.id" :slide-idx="index" :is-generating="isGenerating" class="slide-item" />
  </div>
  <!-- <EditorToolbarMenu :editor="editor" /> -->
</template>

<style scoped lang="less">
.slide-item {
  margin-bottom: 24px;
}
</style>
