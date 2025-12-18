<script setup lang="ts">
import type { PresentationSlide, SlideNode } from '~/types/presentation'

import { slideSchema } from './meta'
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
console.log(props.slide)

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
    :class="
      cn(
        'flex min-h-[50px]',
        'scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30 overflow-hidden p-0 scrollbar-thin scrollbar-track-transparent',
        'relative text-foreground',
        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-50',
        'presentation-slide',
        layoutType,
      )
    "
    :style="style"
    :data-layout="slide.layout"
  >
    <!-- 主视觉（layout image） -->
    <div v-if="slide.layout !== 'none'" :class="cn('slide-image', `layout-${slide.layout}`)">
      <div class="image-placeholder">
        {{ slide.rootImage?.query || 'No Image' }}
      </div>
    </div>

    <!-- 内容区 -->
    <ProsemirrorEditor
      class="slide-content flex-1"
      :content="slide.content"
      :schema="slideSchema"
      :editable="true"
      show-toolbar
      @update="onContentUpdate"
    />
  </div>
</template>

<style scoped>
.presentation-slide {
  border: 1px solid #eee;
  margin-bottom: 24px;
  padding: 16px;
  display: flex;

  &[data-layout='left'] {
    flex-direction: row;

    & .slide-image {
      height: 100%;
    }

  }

  &[data-layout='right'] {
    flex-direction: row-reverse;
    & .slide-image {
      height: 100%;
    }
  }

  &[data-layout='top'] {
    flex-direction: column;
    & .slide-image {
      width: 100%;
    }
  }

  &[data-layout='bottom'] {
    flex-direction: column-reverse;
    & .slide-image {
      width: 100%;
    }
  }

  &[data-layout='none'] {
    .slide-image {
      display: none;
    }
  }

}

.slide-image {
  background: #f4f4f5;
  font-size: 12px;
  padding: 12px;
}

.slide-content {
  flex: 1;
}
</style>
