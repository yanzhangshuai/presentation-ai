<script setup lang="tsx">
import type { DropdownMenuItem } from '@nuxt/ui'

import { BaseFormModal, ConfirmModal, UFormField, UInput } from '#components'

import type { Presentation } from '~/types/presentation'

import { DocumentType } from '~/types/base-document'

/* ------------------ 全局引用 ------------------ */
const toast = useToast()

const overlay = useOverlay()

const router = useRouter()
const localRoute = useLocaleRoute()
const { safeAction } = useSafeActions()

/* ------------------ 数据请求 ------------------ */
const { data, error, refresh } = useFetch('/api/docs/list', { method: 'GET' })

/* ------------------ 状态 ------------------ */
// 当前正在操作的文档 ID
const navigatingId = ref('')

// 创建通用的 Modal 引用
const editTitleModal = overlay.create(BaseFormModal)
const delConfirm = overlay.create(ConfirmModal)

/* ------------------ 工具函数 ------------------ */
// 根据 ID 查找文档
const findDocById = (id: string) => toValue(data)?.items?.find(i => i.id === id)

// 通用 safeAction 配置
const defaultSafeActionOptions = {
  throttle : 300,
  onFinally: () => { navigatingId.value = '' },
}

/* ------------------ 文档操作 ------------------ */

/** 打开文档 */
const { run: openDocs } = safeAction(async (id: string) => {
  const doc = findDocById(id)
  if (!doc)
    return

  navigatingId.value = id

  // 仅处理演示文档
  if (doc.type !== DocumentType.PRESENTATION)
    return

  const presentation = await $fetch<Presentation>(`/api/presentation/${id}`)

  // 有内容就直接打开，否则跳转生成页面
  if (presentation?.doc?.length)
    router.push(localRoute(`/presentation/${id}`))
  else
    router.push(localRoute(`/presentation/generate/${id}`))
}, defaultSafeActionOptions)

/** 修改文档标题 */
const { run: renameDocs } = safeAction(async (id: string) => {
  const item = findDocById(id)
  if (!item)
    return

  const instance = editTitleModal.open({
    title        : $t('dashboard.recent.renameTitle'),
    initialValues: { title: item.title || $t('presentation.untitled') },

    bodyComponent: (props: { modelValue: { title: string } }) => (
      <div class="space-y-2">
        <UFormField label={$t('dashboard.recent.renameLabel')}>
          <UInput
            class="w-full"
            modelValue={props.modelValue.title}
            onUpdate:modelValue={val => (props.modelValue.title = val)}
            placeholder={item.title || $t('presentation.untitled')}
            autofocus
          />
        </UFormField>
      </div>
    ),
  })

  // 等待用户操作结果
  const updatedData = await instance.result
  if (updatedData) {
    await $fetch(`/api/docs/${id}/title`, {
      method: 'PUT',
      body  : { title: updatedData.title },
    })

    toast.add({
      title   : $t('common.updateSuccess'),
      duration: 3000,
    })
    refresh()
  }
}, defaultSafeActionOptions)

/** 删除文档 */
const { run: delDocs } = safeAction(async (id: string) => {
  const instance = delConfirm.open({
    title       : $t('dashboard.recent.deleteConfirmTitle'),
    description : $t('dashboard.recent.deleteConfirmContent'),
    color       : 'error',
    confirmLabel: $t('dashboard.recent.deleteButton'),
    icon        : 'i-lucide-trash-2',
  })

  const isConfirmed = await instance.result
  if (!isConfirmed)
    return

  await $fetch(`/api/docs/${id}`, { method: 'DELETE' })
  refresh()

  toast.add({
    title   : $t('common.deleteSuccess'),
    duration: 1000,
  })
}, defaultSafeActionOptions)

/* ------------------ DropdownMenu 配置 ------------------ */
const dropdownItems: DropdownMenuItem[] = [
  { label: $t('common.rename'), icon: 'i-lucide-edit', onClick: renameDocs },
  { label: $t('common.delete'), icon: 'i-lucide-trash-2', onClick: delDocs },
]
</script>

<template>
  <div v-if="data?.items.length" class="space-y-4">
    <!-- 标题栏 -->
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

    <!-- 错误提示 -->
    <div v-if="error" class="text-red-900">{{ error }}</div>

    <!-- 文档列表 -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="doc in data?.items"
        :key="doc.id"
        variant="outline"
        class="group cursor-pointer relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
        :ui="{ body: 'p-0 sm:p-0', footer: 'p-3 sm:p-3' }"
        @click="openDocs(doc.id)"
      >
        <!-- 缩略图 -->
        <div class="relative aspect-video bg-muted">
          <img
            v-if="doc.thumbnailUrl"
            :src="doc.thumbnailUrl"
            :alt="doc.title"
            class="w-full h-full object-cover"
          >
          <div v-else class="flex h-full w-full items-center justify-center bg-primary/10">
            <UIcon
              name="i-lucide-clock"
              class="text-4xl transition-all"
              :class="cn(navigatingId === doc.id ? 'animate-spin text-primary' : 'text-primary/50')"
            />
          </div>
        </div>

        <!-- 操作菜单 -->
        <UDropdownMenu :items="dropdownItems" size="sm">
          <UIcon
            name="i-lucide-more-horizontal"
            class="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            @click.stop=""
          />
          <template #item="{ item }">
            <div class="w-full text-start" @click="item.onClick?.(doc.id)">
              <UIcon :name="item.icon" class="mr-1" />
              <span>{{ item.label }}</span>
            </div>
          </template>
        </UDropdownMenu>

        <!-- 卡片底部信息 -->
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
