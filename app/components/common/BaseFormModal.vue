<script setup lang="ts" generic="T extends Record<string, any>">
import type { FormSubmitEvent } from '#ui/types'

import { toRaw } from 'vue'

const props = defineProps<{
  title        : string
  description? : string
  bodyComponent: any
  bodyProps?   : Record<string, any>
  initialValues: T
}>()

const emit = defineEmits<{
  close: [result: T | null]
}>()

// 2. 修复 Reactive 泛型问题：使用 ref 代替 reactive
// 在处理泛型 T 时，Ref<T> 的类型推导比 Reactive<T> 更稳定
const state = ref<T>({ ...props.initialValues })

const formRef = useTemplateRef('formRef')

async function onSave() {
  // 提交时，将 ref 的值转为原始数据并断言为 T
  // 使用 toRaw 确保去掉响应式代理
  emit('close', toRaw(state.value) as T)
}

function onCancel() {
  emit('close', null)
}

// 如果需要手动触发 UForm 的提交验证
async function handleSubmit(event: FormSubmitEvent<T>) {
  emit('close', event.data)
}
</script>

<template>
  <UModal :title="title" :description="description">
    <template #body>
      <!-- 设置 ref="formRef" 对应 useTemplateRef -->
      <UForm
        ref="formRef"
        :state="state"
        class="space-y-4"
        @submit="handleSubmit"
      >
        <component
          :is="bodyComponent"
          v-model="state"
          v-bind="bodyProps"
        />
      </UForm>
    </template>

    <template #footer>
      <div class="flex gap-2 ml-auto">
        <UButton
          :label="$t('common.cancel')"
          color="neutral"
          variant="outline"
          @click="onCancel"
        />
        <UButton
          :label="$t('common.ok')"
          color="primary"
          @click="onSave"
        />
      </div>
    </template>
  </UModal>
</template>
