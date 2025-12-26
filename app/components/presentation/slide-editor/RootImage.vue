<script setup lang="ts">
import type { LayoutType } from '~/types/presentation'

import { addImageLibraryItem, generateAiImage, getAiImageResult, queryStockImage } from '~/services/image'

const props = defineProps<{
  slideIdx: number
  slideId : string
}>()

const { safeAction } = useSafeActions()

const presentationStore = usePresentationStore()
const { slides, presentation } = storeToRefs(presentationStore)
const { setSlide } = presentationStore

const slide = computed(() => {
  return slides.value.find(s => s.id === props.slideId)!
})
const layout = computed<LayoutType>(() => slide.value.layout)
const rootImage = computed(() => slide.value.rootImage!)

const state = reactive<{
  loading : 'uploading' | 'ai' | ''
  progress: number
}>({
  loading : '',
  progress: 0,
})

const { upload } = useUploader()

const { run: onUpload } = safeAction(async () => {
  const file = await pickFile({
    accept: 'image/*',
  })
  if (!file) {
    return
  }

  state.loading = 'uploading'
  const url = await upload(file, {
    dir       : 'images',
    onProgress: (p) => {
      state.progress = p
    },
  })

  setSlide(props.slideIdx, {
    ...slide.value,
    rootImage: Object.assign(slide.value.rootImage!, {
      url,
    }),
  })

  addImageLibraryItem(url)
}, {
  throttle : 300,
  onFinally: () => {
    state.loading = ''
    state.progress = 0
  },
})

const { run: onGenerate } = safeAction(async () => {
  state.loading = 'ai'

  let url = ''
  if (toValue(presentation)?.imageSource === 'ai') {
    // AI生成图片
    const { taskId }  = await generateAiImage({
      prompt     : rootImage.value.query,
      layout     : toValue(layout)!,
      modelPicker: toValue(presentation)?.imageProvider,
      modelId    : toValue(presentation)?.imageModelId,
    })

    const result = await poll(
      () => getAiImageResult(taskId),
      res => res.status === 'succeeded' || res.status === 'failed',
      3000,
    )

    if (result.status === 'failed') {
      throw new Error(result.message || 'AI image generation failed')
    }
    url = result.url || ''
  }
  else if (toValue(presentation)?.imageSource === 'stock') {
    // 库存图片
    const res = await queryStockImage({
      prompt: rootImage.value.query,
      layout: toValue(layout)!,
    })

    url = res.url || ''
  }

  setSlide(props.slideIdx, {
    ...slide.value,
    rootImage: Object.assign(slide.value.rootImage!, {
      url,
    }),
  })
}, {
  throttle : 300,
  onFinally: () => {
    state.loading = ''
  },
})
</script>

<template>
  <div
    v-if="layout !== 'none' && rootImage"
    class="
      h-full overflow-hidden flex-center
      bg-linear-to-b from-black/5 to-black/10 dark:from-white/5 dark:to-white/10
    "
  >
    <div v-if="!rootImage.url" class="image-placeholder flex flex-col items-center gap-4">
      <!-- 默认状态· -->
      <template v-if="!state.loading">
        <div class="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm bg-white dark:bg-black">
          <UIcon name="i-lucide-image" class="w-10 h-10 text-muted-foreground" />
        </div>

        <div class="text-center space-y-2">
          <p class="text-sm font-medium text-foreground">{{ $t('presentation.rootImage.placeholderTitle') }}</p>
          <p class="text-xs text-muted-foreground">
            {{ $t('presentation.rootImage.placeholderDesc') }}
          </p>
        </div>

        <div class="flex gap-4">
          <UButton
            variant="outline"
            class-name="h-10 px-6 font-medium shadow-sm hover:shadow transition-shadow bg-transparent"
            @click="onUpload"
          >
            <UIcon name="i-lucide-upload" class="h-4 w-4" />
            {{ $t('presentation.rootImage.uploadBtn') }}
          </UButton>
          <!-- TODO:选择 -->
          <UButton @click="onGenerate">
            <UIcon name="i-lucide-sparkles" class="h-4 w-4" />
            {{ $t('presentation.rootImage.generateBtn') }}
          </UButton>
        </div>
      </template>

      <!-- 上传中状态· -->
      <div v-else-if="state.loading === 'uploading'" class="flex flex-col items-center gap-4">
        <UIcon
          name="i-lucide-cloud-upload"
          class="h-10 w-10 animate-bounce text-muted-foreground"
        />
        <p class="text-sm font-medium text-foreground">
          {{ $t('presentation.rootImage.uploading', { progress: Math.floor(state.progress * 100) }) }}
        </p>
        <UProgress :value="state.progress" class="w-48" />
      </div>

      <!-- 生成中状态· -->
      <div v-else-if="state.loading === 'ai'" class="flex flex-col items-center gap-4">
        <UIcon
          name="i-custom-robot"
          class="h-10 w-10 animate-bounce text-muted-foreground text-primary"
        />
        <p class="text-sm font-medium text-foreground">
          {{ $t('presentation.rootImage.generating') }}
        </p>
      </div>
    </div>

    <div v-else class="relative w-full h-full">
      <img
        :src="rootImage.url"
        alt="Root Image"
        class="w-full h-full object-cover"
      >
    </div>
  </div>
</template>
