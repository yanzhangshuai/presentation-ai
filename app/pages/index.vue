<script lang="ts" setup>
const onClick = () => {
  console.log('Get Started button clicked')
  $fetch('/api/pres/outline', {
    method: 'POST',
    body  : {
      prompt       : 'Sample Topic',
      numberOfCards: 5,
      language     : 'zh',
    },
  })
    .then((data) => {
      console.log('Fetched home data:', data)
    })
    .catch((error) => {
      console.error('Error fetching home data:', error)
    })
}

onMounted(() => {
  console.log('Home page mounted')
})
</script>

<template>
  <div class="notebook-section h-full w-full">
    <div class="mx-auto max-w-4xl space-y-12 px-6 py-12">
      <section class="text-center">
        <h1 class="text-5xl text-primary mb-5">{{ $t('dashboard.title') }}</h1>

        <p class="text-2xl text-gray-400 dark:text-gray-100">{{ $t('dashboard.subtitle') }}</p>
      </section>

      <DashboardGenerate />
      <DashboardRecent />
    </div>
  </div>
</template>
