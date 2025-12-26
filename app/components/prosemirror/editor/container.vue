<script setup lang="ts">
import { cva } from 'class-variance-authority'

const props = withDefaults(defineProps<{
  variant? : 'default' | 'demo' | 'select' | 'comment' | 'ai' | 'aiChat' | 'allweone' | 'fullWidth' | 'none' | 'ghost'
  focused? : boolean
  editable?: boolean
}>(), {
  variant : 'ghost',
  editable: true,
  focused : false,
})

const editorVariants = cva(
  cn(
    'group/editor',
    'relative w-full cursor-text overflow-x-hidden break-words whitespace-pre-wrap select-text',
    'rounded-md ring-offset-background focus-visible:outline-none',
    'placeholder:text-muted-foreground/80 **:data-slate-placeholder:top-[auto_!important] **:data-slate-placeholder:text-muted-foreground/80 **:data-slate-placeholder:opacity-100!',
    '[&_strong]:font-bold',
  ),
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      disabled: {
        true: 'cursor-not-allowed opacity-50',
      },
      focused: {
        true: 'ring-2 ring-ring ring-offset-2',
      },
      variant: {
        ghost   : '',
        allweone: 'size-full pt-4 pb-72 text-base',
        ai      : 'w-full px-0 text-base md:text-sm',
        aiChat:
          'max-h-[min(70vh,320px)] w-full max-w-[700px] overflow-y-auto px-3 py-2 text-base md:text-sm',
        comment: cn('rounded-none border-none bg-transparent text-sm'),
        default:
          'size-full px-16 pt-4 pb-72 text-base sm:px-[max(64px,calc(50%-350px))]',
        demo     : 'size-full px-16 pt-4 pb-72 text-base sm:px-[max(64px,calc(50%-350px))]',
        fullWidth: 'size-full px-16 pt-4 pb-72 text-base sm:px-24',
        none     : '',
        select   : 'px-3 py-2 text-base data-readonly:w-fit',
      },
    },
  },
)
</script>

<template>
  <div
    :class="cn(editorVariants({
      disabled: !editable,
      focused,
      variant,
    }))"
  >
    <slot />
  </div>
</template>

<style scoped lang="less">

</style>
