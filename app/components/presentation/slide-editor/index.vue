<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'

import type { SlideDoc } from '~/types/presentation'

import Controls from './Controls.vue'
import RootImage from './RootImage.vue'
// import Controls from './Controls.vue'

const props = defineProps<{
  slideIdx     : number
  slideId      : string
  isGenerating?: boolean
}>()

const { setEditor } = useSlideEditor()
const presentationStore = usePresentationStore()
const { slides } = storeToRefs(presentationStore)

const slide = computed(() => {
  return slides.value.find(s => s.id === props.slideId)!
})

const editable = computed(() => {
  return !props.isGenerating
})

function onContentUpdate(content: SlideDoc) {
  presentationStore.setSlide(props.slideIdx, {
    ...toRaw(slide.value),
    doc: content,
  })
}

const layoutType = computed(() => {
  if (slide.value.layout === 'none')
    return 'none'
  if (slide.value.layout === 'left')
    return 'flex-row-reverse'
  if (slide.value.layout === 'right')
    return 'flex-row'
  if (slide.value.layout === 'top')
    return 'flex-col-reverse'
  if (slide.value.layout === 'bottom')
    return 'flex-col'
  if (slide.value.layout === 'background')
    return 'flex-col'
  return ''
})

const MaxW = computed(() => {
  const w = slide.value.width ?? 'M'

  const sizeMap: Record<string, string> = {
    S: 'max-w-4xl',
    M: 'max-w-5xl',
    L: 'max-w-6xl',
  }

  return sizeMap[w]
})

const style = computed(() => {
  return {
    borderRadius   : 'var(--presentation-border-radius, 0.5rem)',
    backgroundColor: toValue(slide)?.bgColor || undefined,
    backgroundImage: toValue(slide)?.layout === 'background' && toValue(slide)?.rootImage?.url
      ? `url(${toValue(slide)?.rootImage?.url || ''})`
      : undefined,
    backgroundSize    : 'cover',
    backgroundPosition: 'center',
    backgroundRepeat  : 'no-repeat',
  }
})

const onFocus = (doc: SlideDoc, editor: Editor) => {
  setEditor(editor)
}
</script>

<template>
  <div
    :class="cn(
      'presentation-slide w-full min-h-96 relative text-foreground overflow-hidden ',
      'group/card-container w-full grid focus-within:ring-2! focus-within:ring-primary! focus-within:ring-opacity-50',
      layoutType,
      MaxW,
    )"
    :style="style"
  >
    <Controls :slide="slide">
      <div class="flex" :data-layout="slide.layout">
        <!-- 主视觉（layout image） -->
        <RootImage class="slide-image" :slide-idx="slideIdx" :slide-id="slideId" />

        <!-- 内容区 -->
        <LazyPptEditor
          class="slide-content flex-1 flex-center"
          :doc="slide.doc"
          show-toolbar
          @update="onContentUpdate"
          @focus="onFocus"
        />
      </div>
      <div v-if="!editable" class="absolute top-0 left-0 w-full h-full" />
    </Controls>
  </div>
</template>

<style scoped>
.presentation-slide {

  [data-layout='left'] {
    flex-direction: row;

    .slide-image {
      width: 40%;
      height: 100%;
    }

  }

  [data-layout='right'] {
    flex-direction: row-reverse;

    .slide-image {
      width: 40%;
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

  [data-layout='background'] {
    flex-direction: column;

    .slide-image {

      display: none;
    }
  }

}
</style>
