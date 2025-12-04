<script lang="ts" setup>
const { createParams } = storeToRefs(usePresStore()) // 获取创建参数的响应式引用
const localeRoute = useLocaleRoute()
const router = useRouter()
const { status } = useAuth()
const { signIn } = useSign() // 登录方法
const { safeAction } = useSafeActions()

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
      title   : toValue(createParams).prompt.substring(0, 50) || 'Untitled Presentation',
      language: toValue(createParams).language,
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
            v-model="createParams.prompt"
            v-model:web="createParams.web"
            @generate="onGenerate"
          />
        </div>

        <GenerateControls
          v-model:language="createParams.language"
          v-model:num-page="createParams.numPage"
          :model-id="createParams.modelId"
          :model-provider="createParams.modelProvider"
          :page-style="createParams.pageStyle"
          show-label
        />

        <UButton
          size="xl"
          class="flex ml-auto cursor-pointer"
          :loading="isGenerating"
          :disabled="!createParams.prompt || isGenerating"
          @click="onGenerate"
        >
          <UIcon name="i-lucide-rocket" />
          {{ $t('dashboard.generate') }}
        </UButton>
      </section>

      <!-- 示例快速填充 -->
      <DashboardExamples
        @click="(e) => {
          createParams.prompt = e.title
          createParams.numPage = e.slides
          createParams.language = e.language
          createParams.pageStyle = e.style
        }"
      />

      <!-- 最近文稿，仅登录用户可见 -->
      <DashboardRecent v-if="status === 'authenticated'" />
    </div>
  </div>
</template>
