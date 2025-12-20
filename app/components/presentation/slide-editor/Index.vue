<script setup lang="ts">
import type { PresentationSlide, SlideNode } from '~/types/presentation'

import { slideSchema } from './meta'
import Controls from './Controls.vue'
import RootImage from './RootImage.vue'
// import Controls from './Controls.vue'

const props = defineProps<{
  slide    : PresentationSlide
  editable?: boolean
}>()

const emit = defineEmits<{
  update: [slide: PresentationSlide]
}>()

function onContentUpdate(content: SlideNode[]) {
  emit('update', {
    ...props.slide,
    content,
  })
}

const layoutType = computed(() => {
  if (props.slide.layout === 'none')
    return 'none'
  if (props.slide.layout === 'left')
    return 'flex-row-reverse'
  if (props.slide.layout === 'right')
    return 'flex-row'
  if (props.slide.layout === 'top')
    return 'flex-col-reverse'
  if (props.slide.layout === 'bottom')
    return 'flex-col'
  if (props.slide.layout === 'background')
    return 'flex-col'
  return ''
})

const MaxW = computed(() => {
  const w = props.slide.width ?? 'M'

  const sizeMap: Record<string, string> = {
    S: 'max-w-4xl',
    M: 'max-w-5xl',
    L: 'max-w-6xl',
  }

  return sizeMap[w]
})

const style = computed(() => {
  const slide = props.slide

  return {
    borderRadius   : 'var(--presentation-border-radius, 0.5rem)',
    backgroundColor: slide.bgColor || undefined,
    backgroundImage: slide.layout === 'background' && slide.rootImage?.url
      ? `url(${slide.rootImage.url})`
      : undefined,
    backgroundSize    : 'cover',
    backgroundPosition: 'center',
    backgroundRepeat  : 'no-repeat',
  }
})
</script>

<template>
  <div
    :class="cn(
      'presentation-slide w-full min-h-96 relative text-foreground overflow-hidden ',
      'group/card-container grid focus-within:ring-2! focus-within:ring-primary! focus-within:ring-opacity-50',
      layoutType,
      MaxW,
    )" :style="style"
  >
    <Controls :slide="slide">
      <div class="flex" :data-layout="slide.layout">
        <!-- 主视觉（layout image） -->
        <RootImage class="slide-image" :root-image="slide.rootImage" :layout="slide.layout" />

        <!-- 内容区 -->
        <ProsemirrorEditor
          class="slide-content flex-1 flex-center" :content="slide.content" :schema="slideSchema" :editable="true"
          show-toolbar @update="onContentUpdate"
        />
      </div>
    </Controls>
  </div>
</template>

<style scoped>
.presentation-slide {

  [data-layout='left'] {
    flex-direction: row;

    .slide-image {
      width: 45%;
      height: 100%;
    }

  }

  [data-layout='right'] {
    flex-direction: row-reverse;

    .slide-image {
      width: 45%;
      height: 100%;
    }
  }

  [data-layout='top'] {
    flex-direction: column;

    .slide-image {
      width: 100%;
      height: 280px;
    }
  }

  [data-layout='bottom'] {
    flex-direction: column-reverse;

    .slide-image {
      width: 100%;
      height: 280px;
    }
  }

}
</style>
