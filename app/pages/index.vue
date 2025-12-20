<script lang="ts" setup>
const localeRoute = useLocaleRoute()
const router = useRouter()
const { status } = useAuth()
const { signIn } = useSign() // 登录方法
const { safeAction } = useSafeActions()

const { state } = storeToRefs(usePresentationCreateStore())

// ------------------------------
// 生成演示文稿函数
// ------------------------------
const { run: onGenerate, loading: isGenerating } = safeAction(async () => {
  // 未登录用户跳转登录
  if (toValue(status) === 'unauthenticated') {
    signIn()
    return
  }

  // 调用创建 API
  const res = await $fetch('/api/presentation/create', {
    method: 'POST',
    body  : {
      title        : toValue(state).prompt.substring(0, 50) || 'Untitled Presentation',
      language     : toValue(state).language,
      modelProvider: toValue(state).modelProvider,
      modelId      : toValue(state).modelId,
      pageStyle    : toValue(state).pageStyle,
      numSlides    : toValue(state).numSlides,
      prompt       : toValue(state).prompt,
    },
  })

  // 跳转到生成页面
  router.push(localeRoute(`/presentation/generate/${res.id}`))
})
</script>

<template>
  <div class="notebook-section h-full w-full">
    <div class="mx-auto max-w-4xl space-y-12 px-6 py-12">
      <!-- 页面标题与副标题 -->
      <section class="text-center">
        <h1 class="text-5xl text-primary mb-5">{{ $t('dashboard.title') }}</h1>
        <p class="text-2xl text-gray-400 dark:text-gray-100">{{ $t('dashboard.subtitle') }}</p>
      </section>

      <!-- 输入与生成控件 -->
      <section class="space-y-6">
        <div class="space-y-2">
          <h3>{{ $t('dashboard.presendAbout') }}</h3>
          <DashboardInput
            v-model="state.prompt"
            v-model:web="state.web"
            @generate="onGenerate"
          />
        </div>

        <PresentationGenerateControls
          v-model:language="state.language"
          v-model:num-slides="state.numSlides"
          :model-id="state.modelId"
          :model-provider="state.modelProvider"
          :page-style="state.pageStyle"
          show-label
        />

        <UButton
          size="xl"
          class="flex ml-auto cursor-pointer"
          :loading="isGenerating"
          :disabled="!state.prompt || isGenerating"
          @click="onGenerate"
        >
          <UIcon name="i-lucide-rocket" />
          {{ $t('dashboard.generate') }}
        </UButton>
      </section>

      <!-- 示例快速填充 -->
      <DashboardExamples
        @click="(e) => {
          state.prompt = e.title
          state.numSlides = e.slides
          state.language = e.language
          state.pageStyle = e.style
        }"
      />

      <!-- 最近文稿，仅登录用户可见 -->
      <DashboardRecent v-if="status === 'authenticated'" />
    </div>
  </div>
</template>
