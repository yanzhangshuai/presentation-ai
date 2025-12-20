<script setup lang="ts">
import type { PresentationDoc, PresentationSlide } from '~/types/presentation'

import {   PresentationStatus } from '~/types/presentation'
import { editPresentation, getPresentation, slidesGenerationStream } from '~/services/presentation'

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
const { setPresentation } = usePresentationStore()
const { setTheme } = usePresentationThemeStore()

const id = computed(() => route.params.id?.toString())

const presentationDoc = ref<PresentationDoc>({
  id         : '',
  title      : '',
  description: '',
  slides     : [],
  createdAt  : 0,
  updatedAt  : 0,
})

// ------------------------------
// 数据获取：拉取演示文稿信息
// ------------------------------
const { data, status, error } = getPresentation(toValue(id)!)

if (import.meta.client) {
  watchEffect(() => {
    if (!data.value)
      return

    setTheme(data.value.theme)
    setPresentation(data.value)
    if (data.value?.status === PresentationStatus.Content) {
      presentationDoc.value = JSON.parse(data.value.content)

      console.log('Loaded presentation document:', presentationDoc.value)
    }
    else {
      // 生成
      presentationDoc.value = {
        id       : toValue(id)!,
        title    : data.value!.base?.title || 'Untitled Presentation',
        slides   : [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      slidesGenerationStream(toValue(id)!, {
        onUpdate: (slide: PresentationSlide) => {
          presentationDoc.value.slides.push(slide)
        },
        onFinish: () => {
          editPresentation(toValue(id)!, {
            content: JSON.stringify(presentationDoc.value),
          })
          //
            .catch((err) => {
              toast.add({
                title: err.message || 'Failed to save generated presentation.',
                color: 'error',
              })
            })
        },
        onError: (err: Error) => {
          console.error('Slides generation stream error:', err)
        },
      })
    }
  })
}
</script>

<template>
  <UiPage
    :status="status"
    :error="error"
    :loading-title="$t('presentation.loading')"
    :loading-text="$t('presentation.loadingWait')"
  >
    <div class="presentation-slides flex max-h-full flex-1 pb-20">
      <div class="mx-auto max-w-[90%] space-y-8 pt-16">
        <PresentationSlideEditor v-for="s in presentationDoc.slides" :key="s.id" :slide="s" class="slide-item" />
      </div>
    </div>
  </UiPage>
</template>

<style scoped lang="less">
.slide-item {
  margin-bottom: 24px;
}
</style>
