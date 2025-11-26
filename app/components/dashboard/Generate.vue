<script setup lang="ts">
const isGenerating = ref(false)

const presStore = usePresStore()
const localeRoute = useLocaleRoute()
const router = useRouter()

const onGenerate = async () => {
  isGenerating.value = true

  try {
    const res = await $fetch('/api/pres/create', {
      method: 'POST',
      body  : {
        title   : presStore.prompt.substring(0, 50) || 'Untitled Presentation',
        language: presStore.language,
      },
    })

    router.push(localeRoute(`/pres/generate/${res.id}`))
  }
  catch (error) {
    console.error('Error generating outline:', error)
  }
  finally {
    isGenerating.value = false
  }
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex-between-center">
      <h3>{{ $t('dashboard.presendAbout') }}</h3>
    </div>

    <!--  -->
    <div class="space-y-8">
      <DashboardInput @generate="onGenerate" />

      <DashboardControls />

      <UButton
        size="xl"
        class="flex ml-auto cursor-pointer"
        :loading="isGenerating"
        :disabled="!presStore.prompt || isGenerating"
        @click="onGenerate"
      >
        <UIcon name="i-lucide-rocket" />
        {{ $t('dashboard.generate') }}
      </UButton>

      <DashboardExamples />
    </div>
  </div>
</template>

<style scoped lang="less">

</style>
