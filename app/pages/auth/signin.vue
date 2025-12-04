<script setup lang="ts">
import SignIn from '~/components/SignIn.vue'

definePageMeta({
  layout: false,
})

const { query } = useRoute()

const callbackUrl = computed(() => {
  return query.callbackUrl?.toString() || undefined
})
</script>

<template>
  <div
    class="
      h-screen
      bg-linear-to-br from-neutral-100 via-neutral-200 to-neutral-300
      dark:bg-linear-to-br dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-600
    "
  >
    <SignIn mode="normal" :open="true" :callback-url="callbackUrl" />
  </div>
</template>
