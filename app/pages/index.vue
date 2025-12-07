<script lang="ts" setup>
const localeRoute = useLocaleRoute()
const router = useRouter()
const { status } = useAuth()
const { signIn } = useSign() // 登录方法
const { safeAction } = useSafeActions()

const params = reactive({
  prompt       : '',
  modelProvider: 'deepseek' as ModelProvider,
  modelId      : 'deepseek-chat' as string,
  numSlides    : 5,
  language     : 'zh' as LanguageSupport,
  pageStyle    : 'default' as string,
  web          : false,
})

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
      title        : toValue(params).prompt.substring(0, 50) || 'Untitled Presentation',
      language     : toValue(params).language,
      modelProvider: toValue(params).modelProvider,
      modelId      : toValue(params).modelId,
      pageStyle    : toValue(params).pageStyle,
      numSlides    : toValue(params).numSlides,
      prompt       : toValue(params).prompt,
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
            v-model="params.prompt"
            v-model:web="params.web"
            @generate="onGenerate"
          />
        </div>

        <PresentationGenerateControls
          v-model:language="params.language"
          v-model:num-slides="params.numSlides"
          :model-id="params.modelId"
          :model-provider="params.modelProvider"
          :page-style="params.pageStyle"
          show-label
        />

        <UButton
          size="xl"
          class="flex ml-auto cursor-pointer"
          :loading="isGenerating"
          :disabled="!params.prompt || isGenerating"
          @click="onGenerate"
        >
          <UIcon name="i-lucide-rocket" />
          {{ $t('dashboard.generate') }}
        </UButton>
      </section>

      <!-- 示例快速填充 -->
      <DashboardExamples
        @click="(e) => {
          params.prompt = e.title
          params.numSlides = e.slides
          params.language = e.language
          params.pageStyle = e.style
        }"
      />

      <!-- 最近文稿，仅登录用户可见 -->
      <DashboardRecent v-if="status === 'authenticated'" />
    </div>
  </div>
</template>
