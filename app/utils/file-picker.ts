interface CommonOptions {
  accept?: string
}

/** 单文件（默认） */
export type PickSingleOptions = CommonOptions & {
  multiple? : false
  directory?: false
  capture?  : boolean | 'user' | 'environment'
}

/** 多文件 */
export type PickMultipleOptions = CommonOptions & {
  multiple  : true
  directory?: false
  capture?  : never
}

/** 目录选择 */
export type PickDirectoryOptions = CommonOptions & {
  directory: true
  multiple?: never
  capture? : never
}

export type PickFileOptions
  = | PickSingleOptions
    | PickMultipleOptions
    | PickDirectoryOptions

// ✅ 单选 → File | null
export function pickFile(
  options?: PickSingleOptions,
): Promise<File | null>

// ✅ 多选 → File[]
export function pickFile(
  options: PickMultipleOptions,
): Promise<File[]>

export function pickFile(
  options: PickSingleOptions | PickMultipleOptions = {},
): Promise<File | File[] | null> {
  const {
    accept = '',
    multiple = false,
  } = options

  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = multiple
    input.style.display = 'none'

    const cleanup = () => {
      document.body.removeChild(input)
    }

    const done = () => {
      if (multiple) {
        resolve(input.files ? Array.from(input.files) : [])
      }
      else {
        resolve(input.files?.[0] ?? null)
      }
      cleanup()
    }

    input.addEventListener('change', done, { once: true })
    input.addEventListener('blur', () => setTimeout(done, 0), {
      once: true,
    })

    document.body.appendChild(input)
    input.click()
  })
}
