<script setup lang="ts">
import type { PresentationSlide } from '~/types/presentation'

import { PresentationStatus } from '~/types/presentation'
import { getPresentation } from '~/services/presentation'

// ------------------------------
// 页面元信息配置
// ------------------------------
definePageMeta({
  layout: 'presentation',
  validate(route) {
    // 确保路由参数 id 存在且为非空字符串
    const id = route.params.id
    return typeof id === 'string' && id.length > 0
  },
})

const route = useRoute()
const toast = useToast()

const presentationStore = usePresentationStore()
const { presentationDoc } = storeToRefs(presentationStore)
const { setPresentation, autoSaveDoc, addSlide, setSlides, saveDoc } = presentationStore

const { setTheme } = usePresentationThemeStore()

const slidesRef = useTemplateRef('presentationSlides')

const id = computed(() => route.params.id?.toString())

// ------------------------------
// 数据获取：拉取演示文稿信息
// ------------------------------
const { data, status, error } = getPresentation(toValue(id)!)

const { generate, status: generationStatus } = useGeneration(toValue(id)!, {
  onUpdate: (slides: PresentationSlide[]) => {
    setSlides(slides)

    requestAnimationFrame(() => {
      // 滚动到最后一张幻灯片
      document.querySelector('.main')?.scrollTo({
        top     : document.querySelector('.main')!.scrollHeight,
        behavior: 'smooth',
      })
    })
  },
  onFinish: () => {
    saveDoc()
      .then(() => {
        autoSaveDoc()
      })
      .catch((err) => {
        toast.add({
          title: err.message || 'Failed to save generated presentation.',
          color: 'error',
        })
      })
  },
  onError: (err: Error) => {
    console.error('Slides generation error:', err)
  },
})

if (import.meta.client) {
  watch(data, () => {
    if (!data.value)
      return

    setTheme(data.value.theme)
    setPresentation(data.value)
    if (data.value?.status !== PresentationStatus.Doc) {
      // 生成
      presentationDoc.value = {
        id       : toValue(id)!,
        title    : data.value!.base?.title || 'Untitled Presentation',
        slides   : [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      generate()

      // slidesGenerationStream(toValue(id)!, {
      //   onUpdate: (slide: PresentationSlide) => {
      //     addSlide(slide)
      //   },
      //   onFinish: () => {
      //     saveDoc()
      //       .then(() => {
      //         autoSaveDoc()
      //       })
      //       .catch((err) => {
      //         toast.add({
      //           title: err.message || 'Failed to save generated presentation.',
      //           color: 'error',
      //         })
      //       })
      //   },
      //   onError: (err: Error) => {
      //     console.error('Slides generation stream error:', err)
      //   },
      // })
    }
    else {
      autoSaveDoc()
    }
  })
}
</script>

<template>
  <UIPage
    :status="status" :error="error" :loading-title="$t('presentation.loading')"
    :loading-text="$t('presentation.loadingWait')"
  >
    <div class="presentation-slides flex max-h-full flex-1 pb-20">
      <div class="mx-auto max-w-[90%] space-y-8 pt-16">
        <ClientOnly>
          <LazyPresentationSlides ref="presentationSlides" :is-generating="generationStatus === 'pending'" />
        </ClientOnly>
      </div>
    </div>
  </UIPage>
</template>

<style>
@import '~/assets/css/presentation.css';
</style>
