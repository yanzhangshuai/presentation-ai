<script setup lang="ts">
const props = defineProps<{
  title        : string
  description  : string
  icon?        : string
  confirmLabel?: string
  cancelLabel? : string
  color?       : 'primary' | 'error' | 'warning' | 'neutral'
}>()

const emit = defineEmits<{
  close: [result: boolean]
}>()

function onConfirm() {
  emit('close', true)
}

function onCancel() {
  emit('close', false)
}
</script>

<template>
  <UModal :title="title" :description="description">
    <!-- <template #body>
      <UAlert
        v-if="color === 'error' || color === 'warning'"
        :color="color"
        variant="subtle"
        :icon="icon || 'i-lucide-alert-triangle'"
        :title="title"
        :description="description"
      />
      <div v-else class="text-sm text-gray-500 dark:text-gray-400">
        {{ description }}
      </div>
    </template> -->

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          :label="cancelLabel || $t('common.cancel')"
          color="neutral"
          variant="ghost"
          @click="onCancel"
        />
        <UButton
          :label="confirmLabel || $t('common.confirm')"
          :color="color || 'primary'"
          @click="onConfirm"
        />
      </div>
    </template>
  </UModal>
</template>
