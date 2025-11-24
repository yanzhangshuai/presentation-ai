<script setup lang="ts">
const props = defineProps({

})

const isGeneratingOutline = ref(false)

const createStore = usePresentationCreate()

const onGenerate = async () => {
  isGeneratingOutline.value = true

  try {
    await $fetch('/api/presentation/create', {
      method: 'POST',
      body  : {
        title   : createStore.prompt.substring(0, 50) || 'Untitled Presentation',
        language: createStore.language,
      },
    })
      .then((res) => {
        console.log('Presentation created:', res)
      })
      .catch((error) => {
        console.error('Error creating presentation:', error)
      })
  }
  catch (error) {
    console.error('Error generating outline:', error)
  }
  finally {
    isGeneratingOutline.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- input -->
    <div class="space-y-2">
      <div class="flex-between-center">
        <h3>{{ $t('dashboard.presendAbout') }}</h3>
      </div>

      <!-- input -->
      <DashboardInput @generate="onGenerate" />
    </div>

    <DashboardControls />

    <UButton
      size="xl"
      class="flex ml-auto cursor-pointer"
      :loading="isGeneratingOutline"
      :disabled="!createStore.prompt || isGeneratingOutline"
      @click="onGenerate"
    >
      <UIcon name="i-lucide-rocket" />
      {{ $t('dashboard.generate') }}
    </UButton>

    <DashboardExamples />
  </div>
</template>

<style scoped lang="less">

</style>
