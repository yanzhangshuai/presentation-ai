<script setup lang="ts">
import type { PresentationDoc, PresentationSlide } from '~/types/presentation'

import { editPresentation, slidesGenerationStream } from '~/services/presentation'

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
const { data: presentationData } = useFetch<Presentation, string>(
  () => `/api/presentation/${id.value}`,
  { method: 'GET' },
)

if (import.meta.client) {
  watchEffect(() => {
    if (presentationData.value?.status === EPresentationStatus.CONTENT_GENERATED) {
      presentationDoc.value = JSON.parse(presentationData.value.content)
    }
    else {
      // 生成
      presentationDoc.value = {
        id       : presentationData.value!.id,
        title    : presentationData.value!.base?.title || 'Untitled Presentation',
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
  <ClientOnly>
    <PresentationSlideEditor v-for="s in presentationDoc.slides" :key="s.id" :slide="s" class="slide-item" />
  </ClientOnly>
</template>

<style scoped lang="less">
.slide-item {
  margin-bottom: 24px;
}
</style>
