<script setup lang="ts">
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

// ------------------------------
// Composables & Store
// ------------------------------
const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()

const { safeAction } = useSafeActions()
const presentationStore = usePresentationStore()
const { presentation } = storeToRefs(presentationStore)

// 当前演示文稿 ID
const id = computed(() => route.params.id!.toString())

// ------------------------------
// 数据获取：拉取演示文稿信息
// ------------------------------
const { data: presentationData, error, status } = useFetch<Presentation, string>(
  () => `/api/presentation/${id.value}`,
  { method: 'GET' },
)

// ------------------------------
// 大纲生成逻辑
// ------------------------------
const { submit, data: generatingData, isLoading, status: outlineStatus } = useOutlineGeneration()

// 当生成数据更新时，同步更新 store
watch(generatingData, (newVal) => {
  if (!presentation.value || !newVal)
    return

  // 更新大纲
  presentation.value.base.title = newVal.title
  presentation.value.outline = newVal.outline
})

// ------------------------------
// 触发生成函数
// ------------------------------
const onGenerateOutline = () => {
  const { prompt, numSlides, language, modelId, modelProvider } = toValue(presentation)!
  submit({
    prompt,
    numSlides,
    language,
    modelId,
    modelProvider,
  })
}

watch(
  presentationData,
  (newVal) => {
    if (newVal) {
      presentationStore.setPresentation(newVal)

      if (!newVal.outline?.length && newVal.prompt) {
        // 如果没有大纲但有提示词，则触发生成
        onGenerateOutline()
      }
    }
  },
  { immediate: true },
)

// ------------------------------
// Presentation生成逻辑
// ------------------------------

const { run: onGeneratePresentation, loading: isGeneratingPresentation } = safeAction(async () => {
  if (!presentation.value)
    return

  await $fetch(`/api/presentation/${id.value}`, {
    method: 'POST',
    body  : {
      title            : presentation.value.base.title,
      theme            : presentation.value.theme,
      language         : presentation.value.language,
      imageSource      : presentation.value.imageSource,
      modelProvider    : presentation.value.modelProvider,
      modelId          : presentation.value.modelId,
      pageStyle        : presentation.value.pageStyle,
      numSlides        : presentation.value.numSlides,
      presentationStyle: presentation.value.presentationStyle,
      prompt           : presentation.value.prompt,
      outline          : presentation.value.outline,
    },
  })

  router.push(localePath(`/presentation/${id.value}`))
})
</script>

<template>
  <!-- 页面容器，显示加载/错误状态 -->
  <UiPage
    :status="status"
    :error="error"
    :loading-title="$t('presentation.loading')"
    :loading-text="$t('presentation.loadingWait')"
  >
    <div v-if="presentation" class="relative flex-1 flex-col">
      <!-- 返回按钮 -->
      <UButton
        variant="ghost"
        class="absolute left-4 top-4 flex items-center gap-2 text-muted-foreground hover:text-foreground"
        @click="$router.back()"
      >
        <UIcon name="i-lucide-arrow-left" />
        {{ $t('common.back') }}
      </UButton>

      <!-- 内容区域 -->
      <main class="max-w-4xl space-y-8 p-8 pt-6 mx-auto pb-32">
        <!-- 控制栏 -->
        <div class="flex-y-center gap-4">
          <span class="text-sm text-foreground">{{ $t('presentation.prompt') }}</span>

          <PresentationGenerateControls
            v-model:language="presentation.language"
            v-model:num-slides="presentation.numSlides"
            :model-id="presentation.modelId"
            :model-provider="presentation.modelProvider"
            :page-style="presentation.pageStyle"
            :show-label="false"
            class="flex-1"
          />
        </div>

        <!-- 输入框 -->
        <PresentationGenerateInput
          v-model="presentation.prompt"
          class="w-full"
          :disabled="isLoading"
          @click="onGenerateOutline"
        />

        <!-- 渲染大纲列表 -->
        <PresentationOutlineList
          v-model:outline="presentation.outline"
          :is-generating="isLoading"
          :total-slides="presentation.numSlides"
        />

        <div class=" rounded-lg border bg-muted/30 p-6">
          <h2 className="text-lg font-semibold">{{ $t('presentation.theme.customizeTitle') }}</h2>

          <PresentationThemeSetting v-model="presentation.theme" />
        </div>

        <!-- image source -->
        <div class="flex flex-col space-y-2">
          <label>{{ $t("presentation.imageSource.title") }}</label>
          <PresentationImageSourceSelect v-model="presentation.imageSource" />
        </div>

        <!-- presentation style -->
        <div class="flex flex-col space-y-2">
          <label>{{ $t("presentation.presentationStyle.title") }}</label>
          <USelect
            v-model="presentation.presentationStyle"
            size="xl"
            class="w-full"
            value-key="key"
            :items="Object.entries(presentationStyles).map(([key, label]) => ({ label, key }))"
          />
        </div>
      </main>

      <!-- TODO:完毕之后显示 -->
      <!-- v-if="outlineStatus === 'success'" -->
      <footer
        class="fixed bottom-0 left-0 right-0 flex justify-center border-t bg-background/80 p-4 backdrop-blur-sm"
      >
        <UButton
          size="xl"
          class="gap-2 px-8"
          :disabled="isGeneratingPresentation"
          @click="onGeneratePresentation"
        >
          <UIcon name="i-lucide-wand-sparkles" />
          {{ isGeneratingPresentation ? $t('presentation.generating') : $t('presentation.generatePresentation') }}
        </UButton>
      </footer>
    </div>
  </UiPage>
</template>
