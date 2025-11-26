<script setup lang="ts">
import { useAppTheme } from '~/composables/theme'

const theme = useAppTheme()

onMounted(() => {
  theme.initTheme()
})
</script>

<template>
  <div>
    <UApp>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
</template>
