// composables/useUploader.ts

import type { Uploader } from '~/utils/upload'

import { createOssUploader, createUploadThingUploader  } from '~/utils/upload'

export function useUploader(): Uploader {
  const config = useRuntimeConfig()

  // runtimeConfig.public.uploadProvider = "oss" | "uploadthing"
  const provider = config.public.uploadProvider ?? 'oss'

  if (provider === 'uploadthing') {
    return createUploadThingUploader()
  }

  return createOssUploader()
}

// const { startUpload } = useUploadThing('videoAndImage', {
//   onClientUploadComplete(res) {
//     console.log(`onClientUploadComplete`, res)
//     alert('Upload Completed')
//   },
// })

// composables/useUploader.ts

// export function useUploader() {
//   const config = useRuntimeConfig()
//   const provider = config.public.uploadProvider ?? 'oss'

//   const uploading = ref(false)
//   const progress = ref(0)

//   const getUploader = () => {
//     if (provider === 'uploadthing')
//       return createUploadThingUploader()

//     return createOssUploader()
//   }

//   async function upload(file: File, options: {
//     dir?     : string
//     filename?: string
//   }) {
//     uploading.value = true
//     progress.value = 0

//     try {
//       return await getUploader().upload(file, {
//         dir     : options.dir,
//         filename: options.filename,
//         onProgress(p) {
//           progress.value = p
//         },
//       })
//     }
//     finally {
//       uploading.value = false
//     }
//   }

//   return {
//     uploading,
//     progress,
//     upload,
//   }
// }
