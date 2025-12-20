<script setup lang="ts">
import { presentationTones } from '#shared/constansts/presentaton'

import { editPresentation, getPresentation } from '~/services/presentation'

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
const { state } = storeToRefs(usePresentationCreateStore())

const themeStore = usePresentationThemeStore()

// 当前演示文稿 ID
const id = computed(() => route.params.id!.toString())

if (!toValue(state).prompt) {
  // ------------------------------
  // 数据获取：拉取演示文稿信息
  // ------------------------------
  const { data } = await getPresentation(toValue(id))

  Object.assign(state.value, {
    prompt       : toValue(data)?.prompt,
    modelProvider: toValue(data)?.modelProvider,
    modelId      : toValue(data)?.modelId,
    numSlides    : toValue(data)?.numSlides,
    language     : toValue(data)?.language,
    pageStyle    : toValue(data)?.pageStyle,
    web          : !!toValue(data)?.searchResults,
    themeId      : toValue(data)?.themeId,
    title        : toValue(data)?.base.title,
    outline      : toValue(data)?.outline,
    imageSource  : toValue(data)?.imageSource,
    tone         : toValue(data)?.tone,
  })

  themeStore.setTheme(toValue(data)!.theme)
}

// ------------------------------
// 大纲生成逻辑
// ------------------------------
const { generate, isLoading, data: outlineData, status: outlineStatus } = useOutlineGeneration()

// ------------------------------
// 触发生成函数
// ------------------------------
const onGenerateOutline = () => {
  const { prompt, numSlides, language, modelId, modelProvider } = toValue(state)!
  generate({
    prompt,
    numSlides,
    language,
    modelId,
    modelProvider,
  })
}

// ------------------------------
// Presentation生成逻辑
// ------------------------------

const { run: onGeneratePresentation, loading: isGeneratingPresentation } = safeAction(async () => {
  if (!state.value)
    return

  await editPresentation(id.value, {
    title        : state.value.title,
    themeId      : state.value.themeId,
    language     : state.value.language,
    modelProvider: state.value.modelProvider,
    modelId      : state.value.modelId,
    numSlides    : state.value.numSlides,
    pageStyle    : state.value.pageStyle,
    imageSource  : state.value.imageSource,
    tone         : state.value.tone,
    prompt       : state.value.prompt,
    outline      : state.value.outline,
  })

  router.push(localePath(`/presentation/${id.value}`))
})

if (!toValue(state).outline?.length && toValue(state).prompt) {
  // 如果没有大纲但有提示词，则触发生成
  onGenerateOutline()
}

watch(
  outlineData,
  (newOutline) => {
    if (!newOutline)
      return

    state.value.title = newOutline.title
    state.value.outline = newOutline.sections
  },
  { deep: true },
)
</script>

<template>
  <!-- 页面容器，显示加载/错误状态 -->
  <div class="relative flex-1 flex-col">
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
          v-model:language="state.language"
          v-model:num-slides="state.numSlides"
          :model-id="state.modelId"
          :model-provider="state.modelProvider"
          :page-style="state.pageStyle"
          :show-label="false"
          class="flex-1"
        />
      </div>

      <!-- 输入框 -->
      <PresentationGenerateInput
        v-model="state.prompt"
        class="w-full"
        :disabled="isLoading"
        @click="onGenerateOutline"
      />

      <!-- 渲染大纲列表 -->
      <PresentationOutlineList
        v-model:outline="state.outline"
        :is-generating="isLoading"
        :total-slides="state.numSlides"
      />

      <div class=" rounded-lg border bg-muted/30 p-6">
        <h2 className="text-lg font-semibold">{{ $t('presentation.theme.customizeTitle') }}</h2>

        <PresentationThemeSetting @change="e => state.themeId = e" />
      </div>

      <!-- image source -->
      <!-- <div class="flex flex-col space-y-2">
          <label>{{ $t("presentation.imageSource.title") }}</label>
          <PresentationImageSourceSelect v-model="presentation.imageSource" />
        </div> -->

      <!-- presentation tone -->
      <div class="flex flex-col space-y-2">
        <label>{{ $t("presentation.tone.title") }}</label>
        <USelect
          v-model="state.tone"
          size="xl"
          class="w-full"
          value-key="key"
          :items="Object.entries(presentationTones).map(([key, label]) => ({ label, key }))"
        />
      </div>
    </main>

    <footer
      v-if="['success', 'idle'].includes(outlineStatus) && state.outline.length > 0"
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
</template>
