<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

import z from 'zod'

/* ------------------ Props ------------------ */
// mode: 区分是弹窗登录还是普通页面登录
// callbackUrl: 登录成功后的回调 URL
// open: 控制弹窗是否打开
const props = defineProps<{
  mode?       : 'modal' | 'normal'
  callbackUrl?: string
  open?       : boolean
}>()

/* ------------------ Emits ------------------ */
// close: 用于关闭弹窗，传入 boolean 表示是否成功关闭
const emit = defineEmits<{
  close: [boolean]
}>()

/* ------------------ 表单校验 Schema ------------------ */
// 使用 zod 定义表单校验规则
const schema = z.object({
  email   : z.email($t('auth.emailError')), // 邮箱格式校验
  password: z.string().min(8, $t('auth.passwordError', { len: 8 })), // 密码最少 8 位
})
type Schema = z.infer<typeof schema>

/* ------------------ Auth & SafeAction ------------------ */
const { signIn } = useAuth() // 调用 auth 模块的 signIn 方法
const { safeAction } = useSafeActions() // 安全执行函数，支持 throttle 和 toast

/* ------------------ Form State ------------------ */
// 使用 reactive 创建响应式表单状态
const state = reactive<Partial<Schema>>({
  email   : '',
  password: '',
})

/* ------------------ 计算属性 ------------------ */
// 判断是否为 modal 模式
const isModal = computed(() => props.mode === 'modal')

/* ------------------ 提交处理 ------------------ */
// 使用 safeAction 包裹 submit 函数，带 throttle 与 toast 提示
const { run: onSubmit } = safeAction(async (_: FormSubmitEvent<Schema>) => {
  // TODO: 暂未启用真实登录
  // const result = await signIn('credentials', {
  //   email: state.email,
  //   password: state.password,
  //   callbackUrl: props.callbackUrl,
  //   redirect: true,
  // })

  // 提交完成后关闭弹窗
  emit('close', true)
}, {
  throttle: 300, // 防抖，避免重复提交
  toast   : {  // 提交提示信息
    success: $t('auth.loginSuccess'),
    error  : $t('auth.loginError', { error: '{{error}}' }),
  },
})
</script>

<template>
  <!-- 弹窗组件 -->
  <UModal
    :open="open"
    :title="$t('auth.login')"
    :description="$t('auth.loginDesc')"
    :modal="isModal"
    :dismissible="isModal"
    :transition="isModal"
    :portal="isModal"
    :ui="{ header: 'border-0 pb-px' }"
    close-icon="i-lucide-x"
    :close="{
      class: cn(!isModal && 'hidden'), // 非 modal 模式隐藏关闭按钮
      onClick: () => emit('close', false), // 点击关闭按钮触发 close
    }"
  >
    <template #body>
      <!-- 表单组件 -->
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <!-- 邮箱输入 -->
        <UFormField :label="$t('auth.email')" name="email">
          <UInput
            v-model="state.email"
            class="w-full"
            size="xl"
            placeholder="m@example.com"
          />
        </UFormField>

        <!-- 密码输入 -->
        <UFormField :label="$t('auth.password')" name="password">
          <UInput
            v-model="state.password"
            class="w-full"
            size="xl"
            type="password"
          />
        </UFormField>

        <!-- 普通提交按钮 -->
        <UButton block size="xl" type="submit" class="cursor-pointer">
          {{ $t('auth.login') }}
        </UButton>

        <!-- GitHub 第三方登录 -->
        <UButton
          block
          size="xl"
          variant="outline"
          class="cursor-pointer"
          @click.stop="signIn('github', { callbackUrl })"
        >
          <UIcon name="i-custom-github2" class="text-base" />
          {{ $t('auth.loginGithub') }}
        </UButton>

        <!-- Google 第三方登录 -->
        <UButton
          block
          size="xl"
          variant="outline"
          class="cursor-pointer"
          @click.stop="signIn('google', { callbackUrl })"
        >
          <UIcon name="i-custom-google" class="text-base" />
          {{ $t('auth.loginGoogle') }}
        </UButton>
      </UForm>
    </template>
  </UModal>
</template>
