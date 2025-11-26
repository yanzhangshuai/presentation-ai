<script setup lang="ts">
const router = useRouter()
const presStore = usePresStore()
const localRoute = useLocaleRoute()

const { status } = useAuth()

if (toValue(status) === 'unauthenticated') {
  router.push(localRoute('/'))
}
</script>

<template>
  <UHeader mode="slideover">
    <template #left>
      <!-- logo -->
      <NuxtLinkLocale to="/" class="text-xl i-flex-center">
        <UIcon name="i-lucide-hop" />
      </NuxtLinkLocale>
      <UIcon name="i-lucide-chevron-right" />
      <span class="fill-dbi tracking-wide font-[AmericanTypewriter] ">
        {{ presStore.pptTitle }}
      </span>
    </template>

    <template #right>
      <UserAvatar />
    </template>
  </UHeader>

  <slot />
</template>

<style lang="less" scoped>
@font-face {
  font-family: "AmericanTypewriter";
  src: url("~/assets/fonts/American_Typewriter.woff") format("woff");
  font-weight: normal;
  font-style: normal;
}
</style>
