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
const presStore = usePresStore()
const { createParams, presentation, outline } = storeToRefs(presStore)

// 当前演示文稿 ID
const id = computed(() => route.params.id!.toString())

// ------------------------------
// 数据获取：拉取演示文稿信息
// ------------------------------
const { data: presData, error, status } = useFetch<Presentation, string>(
  () => `/api/presentation/${id.value}`,
  { method: 'GET' },
)

// 当 presData 更新时，同步更新 store
watch(
  presData,
  (newVal) => {
    if (newVal)
      presStore.setPres(newVal)
  },
  { immediate: true },
)

// ------------------------------
// 大纲生成逻辑
// ------------------------------
const { submit, data: generatingData, isLoading } = useOutlineGeneration()

// 当生成数据更新时，同步更新 store
watch(generatingData, (newVal) => {
  if (!newVal)
    return

  // 更新标题
  if (presentation.value?.base) {
    presentation.value.base.title = newVal.title || ''
  }

  // 更新大纲
  presStore.setOutline(newVal.outline)
})

// ------------------------------
// 触发生成函数
// ------------------------------
const onGenerate = () => {
  submit({
    prompt       : createParams.value.prompt,
    numberOfCards: createParams.value.numPage,
    language     : createParams.value.language,
    modelId      : createParams.value.modelId,
    modelProvider: createParams.value.modelProvider,
  })
}

// ------------------------------
// 页面加载时自动生成
// ------------------------------
onMounted(() => {
  if (createParams.value.prompt) {
    onGenerate()
  }
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
    <div class="max-w-4xl space-y-8 p-8 pt-6 mx-auto">
      <!-- 控制栏 -->
      <div class="flex-y-center gap-4">
        <span class="text-sm text-foreground">{{ $t('presentation.prompt') }}</span>

        <GenerateControls
          v-model:language="createParams.language"
          v-model:num-page="createParams.numPage"
          :model-id="createParams.modelId"
          :model-provider="createParams.modelProvider"
          :page-style="createParams.pageStyle"
          :show-label="false"
          class="flex-1"
        />
      </div>

      <!-- 输入框 -->
      <GenerateInput
        v-model="createParams.prompt"
        class="w-full"
        :disabled="isLoading"
        @click="onGenerate"
      />

      <!-- 渲染大纲列表 -->
      <div v-for="t in outline" :key="t" class="flex items-center gap-2">
        <div class="text-sm text-foreground">{{ t }}</div>
      </div>
    </div>
  </UiPage>
</template>
