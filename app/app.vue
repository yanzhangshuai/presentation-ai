<script setup lang="ts">
import { useTheme } from '~/composables/theme'

const theme = useTheme()

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
