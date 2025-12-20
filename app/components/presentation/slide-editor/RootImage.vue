<script setup lang="ts">
import type { LayoutType, RootImage } from '~/types/presentation'

const props = defineProps<{
  rootImage?: RootImage
  layout    : LayoutType
}>()
</script>

<template>
  <div
    v-if="layout !== 'none' && rootImage"
    class="
      h-full overflow-hidden flex-center
      bg-linear-to-b from-black/5 to-black/10 dark:from-white/5 dark:to-white/10
    "
  >
    <div class="image-placeholder flex flex-col items-center gap-4">
      <div class="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm bg-white dark:bg-black">
        <UIcon name="i-lucide-image" class="w-10 h-10 text-muted-foreground" />
      </div>

      <div class="text-center space-y-2">
        <p class="text-sm font-medium text-foreground">{{ $t('presentation.rootImage.placeholderTitle') }}</p>
        <p class="text-xs text-muted-foreground">
          {{ $t('presentation.rootImage.placeholderDesc') }}
        </p>
      </div>

      <div class="flex gap-2">
        <UButton
          variant="outline"
          class-name="h-10 px-6 font-medium shadow-sm hover:shadow transition-shadow bg-transparent"
        >
          <UIcon name="i-lucide-upload" class="h-4 w-4" />
          {{ $t('presentation.rootImage.uploadBtn') }}
        </UButton>
        <UButton>
          {{ $t('presentation.rootImage.generateBtn') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">

</style>
