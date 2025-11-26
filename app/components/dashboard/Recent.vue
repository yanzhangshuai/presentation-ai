<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

import { DocumentType } from '@prisma/client'

const toast = useToast()
const router = useRouter()
const localRoute = useLocaleRoute()

const { data, error, refresh } = useFetch('/api/docs/list', { method: 'GET' })

const navigatingId  = ref('')

const onClick = async (id: string) => {
  try {
    const doc = toValue(data)?.items.find(item => item.id === id)

    if (!doc)
      return

    navigatingId.value = id

    if (doc.type !== DocumentType.PRESENTATION) {
      // 暂无其他类型
      return
    }

    const presentation = await $fetch<Presentation>(`/api/pres/${id}`, { method: 'GET' })

    if (presentation?.content?.slides?.length) {
      router.push(localRoute(`/pres/${id}`))
    }
    else {
      router.push(localRoute(`/pres/generate/${id}`))
    }
  }
  catch (err: any) {
    toast.add(err.toStirng())
  }
  finally {
    navigatingId.value = ''
  }
}

const onEdit = async (id: string) => {
  const item = toValue(data)?.items?.find(item => item.id === id)
  if (!item)
    return

  // eslint-disable-next-line no-alert
  const title = prompt('', item.title)
  if (!title)
    return

  try {
    await $fetch(`/api/docs/${id}/title`, {
      method: 'PUT',
      body  : {
        title,
      },
    })
    toast.add({
      title   : $t('common.updateSuccess'),
      duration: 1000,
    })
    refresh()
  }
  catch (err) {
    toast.add({
      title   : (err as Error).message,
      duration: 2000,
    })
  }
  finally {
    navigatingId.value = ''
  }
}

const onDel = async (id: string) => {
  // eslint-disable-next-line no-alert
  const res = confirm($t('dashboard.recent.deleteConfirmTitle'))

  if (!res)
    return

  try {
    await $fetch(`/api/docs/${id}`, { method: 'DELETE' })
    toast.add({
      title   : $t('common.deleteSuccess'),
      duration: 1000,
    })
    refresh()
  }
  catch (err) {
    toast.add({
      title   : (err as Error).message,
      duration: 2000,
    })
  }
  finally {
    navigatingId.value = ''
  }
}

const dropdownItems: DropdownMenuItem[] = [
  {
    label  : $t('common.rename'),
    icon   : 'i-lucide-edit',
    onClick: onEdit,
  },
  {
    label  : $t('common.delete'),
    icon   : 'i-lucide-trash-2',
    onClick: onDel,
  },
]
</script>

<template>
  <div v-if="data?.items.length" class="space-y-4">
    <div class="flex-between-center">
      <h3 class="flex-center">
        <UIcon name="i-lucide-clock" class="mr-2" />
        {{ $t('dashboard.recent.title') }}
      </h3>
      <UButton variant="outline" class="cursor-pointer">
        {{ $t('dashboard.recent.viewAll') }}
        <UIcon name="i-lucide-chevron-right" />
      </UButton>
    </div>

    <div v-if="error" class="text-red-900">{{ error }}</div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="doc in data?.items"
        :key="doc.id"
        variant="outline"
        class="group cursor-pointer relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
        :ui="{ body: 'p-0 sm:p-0', footer: 'p-3 sm:p-3' }"
        @click="onClick(doc.id)"
      >
        <div class="relative aspect-video bg-muted">
          <img v-if="doc.thumbnailUrl" :src="doc.thumbnailUrl" :alt="doc.title" class="w-full h-full object-cover ">
          <div v-else class="flex h-full w-full items-center justify-center bg-primary/10">
            <UIcon
              name="i-lucide-clock" class="text-4xl transition-all"
              :class="cn(navigatingId === doc.id ? 'animate-spin text-primary' : 'text-primary/50')"
            />
          </div>
        </div>

        <UDropdownMenu :items="dropdownItems" size="sm">
          <UIcon name="i-lucide-more-horizontal" class="absolute right-2 top-2  opacity-0 transition-opacity duration-200 group-hover:opacity-100" @click.stop="" />

          <template #item="{ item }">
            <div class="w-full text-start" @click.stop="item.onClick?.(doc.id)">
              <UIcon :name="item.icon" class="mr-1" />
              <span>{{ item.label }}</span>
            </div>
          </template>
        </UDropdownMenu>

        <template #footer>
          <div class="flex flex-col space-y-2">
            <h3 class="line-clamp-1 text-lg font-semibold text-foreground">
              {{ doc.title || $t('presentation.untitled') }}
            </h3>
            <div class="flex-y-center text-xs text-muted-foreground">
              <UIcon name="i-lucide-calendar" class="mr-1" />
              <span>{{ new Date(doc.updatedAt).toLocaleString('zh-CN') }}</span>
            </div>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<style scoped lang="less">

</style>
