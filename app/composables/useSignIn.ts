import SignIn from '~/components/SignIn.vue'

interface SignInOptions {
  mode?       : 'modal' | 'normal'
  callbackUrl?: string
  onClose?    : (success: boolean) => void
}

export function useSign() {
  const overlay = useOverlay()
  const modal = overlay.create(SignIn)

  const signIn = (options: SignInOptions = {}) => {
    const { mode = 'modal', callbackUrl, onClose } = options

    modal.open({
      open: true,
      mode,
      callbackUrl,
      onClose,
    })
  }

  return { signIn }
}
