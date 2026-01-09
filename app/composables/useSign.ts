import { LazySignIn } from '#components'

interface SignInOptions {
  mode?       : 'modal' | 'normal'
  callbackUrl?: string
  onClose?    : (success: boolean) => void
}

export function useSign() {
  const overlay = useOverlay()

  const signIn = (options: SignInOptions = {}) => {
    const modal = overlay.create(LazySignIn)

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
