import '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bulletList: {
      setBulletListDirection: (
        direction: 'horizontal' | 'vertical',
      ) => ReturnType
    }
  }
}
