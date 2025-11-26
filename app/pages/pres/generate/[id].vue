<script setup lang="ts">
definePageMeta({
  layout: 'pres',
  validate(route) {
    const id = route.params.id
    return typeof id === 'string' && id.length > 0
  },
})
const route = useRoute()
const presStore = usePresStore()

const id = computed(() => route.params.id!.toString())

const { data, pending, error } = await useFetch<Presentation>(() => `/api/pres/${toValue(id)}` as const, { method: 'GET' })

presStore.pptId = toValue(data)!.base.id
presStore.pptTitle = toValue(data)!.base.title
</script>

<template>
  <div v-if="pending" class="flex h-[calc(100vh-8rem)] flex-col items-center justify-center">
    <div class="relative">
      <UiSpinner class="h-10 w-10 text-primary" />
    </div>
    <div class="space-y-2 text-center">
      <h2 class="text-2xl font-bold">{{ $t('pres.loading') }}</h2>
      <p class="text-muted-foreground">{{ $t('pres.loadingWait') }}</p>
    </div>
  </div>

  <div v-else-if="error" class="flex h-[calc(100vh-8rem)] flex-col items-center justify-center">
    <div class="relative">
      <UIcon name="i-lucide-circle-x" class="h-10 w-10 text-primary" />
    </div>
    <div class="space-y-2 text-center">
      <h2 class="text-2xl font-bold">{{ error }}</h2>
    </div>
  </div>
</template>

<style scoped lang="less">

</style>
