import OSS from 'ali-oss'
/**
 *  创建阿里云 OSS 上传器
 * @returns
 */
// composables/uploaders/ossUploader.ts

export function createOssUploader(): Uploader {
  return {
    async upload(file: File, options: UploadOptions = {}) {
      try {
        // 1️⃣ 获取 STS
        const cfg = await $fetch<{
          region     : string
          bucketName : string
          endpoint   : string
          credentials: {
            AccessKeyId    : string
            AccessKeySecret: string
            SecurityToken  : string
          }
        }>('/api/upload/sts')

        // 2️⃣ 创建 OSS Client
        const client = new OSS({
          region         : cfg.region,
          bucket         : cfg.bucketName,
          accessKeyId    : cfg.credentials.AccessKeyId,
          accessKeySecret: cfg.credentials.AccessKeySecret,
          stsToken       : cfg.credentials.SecurityToken,
          endpoint       : cfg.endpoint,
          secure         : true,
        })

        // 3️⃣ 生成 objectKey
        const ext = file.name.split('.').pop()
        const filename
          = options.filename
            ?? `${crypto.randomUUID()}${ext ? `.${ext}` : ''}`

        const dir = options.dir ?? 'uploads'
        const objectKey = `${dir}/${filename}`

        // 4️⃣ 执行分片上传（核心）
        const result = await client.multipartUpload(objectKey, file, {
        // ✅ 真正可靠的进度
          progress(p) {
            options.onProgress?.(p)

          // 你将来如果要断点续传，可以在这里保存 checkpoint
          // localStorage.setItem("oss-checkpoint", JSON.stringify(checkpoint))
          },

          // 每个分片大小（5MB 是推荐下限，可调大）
          partSize: 5 * 1024 * 1024,

          // 并发分片数量
          parallel: 4,
        })

        // 5️⃣ 返回最终 URL
        return `https://${cfg.bucketName}.${cfg.endpoint.replace(/^https?:\/\//, '')}/${objectKey}`
      // return result.res?.requestUrls?.[0]
      //   ?? `https://${cfg.bucket}.${cfg.endpoint.replace(/^https?:\/\//, '')}/${objectKey}`
      }
      catch (error) {
        console.error('OSS 上传失败', error)
        throw error
      }
    },
  }
}
/**
 *  创建 UploadThing 上传器
 * @returns
 */
export function createUploadThingUploader(): Uploader {
  return {
    async upload(file: File) {
      try {
        return ''
        // const { startUpload } = useUploadThing('videoAndImage', {
        //   onClientUploadComplete(res) {
        //     console.log(`onClientUploadComplete`, res)
        //   },
        // })

        // const res = await startUpload([file])

        // if (res?.length && res[0].fileUrl) {
        //   return res[0].fileUrl
        // }

        // throw new Error('UploadThing 上传失败')
      }
      catch (error) {
        console.error('UploadThing 上传失败', error)
        throw error
      }
    },
  }
}

export interface UploadOptions {
  dir?       : string
  filename?  : string
  onProgress?: (progress: number) => void
}

export interface Uploader {
  upload: (file: File, options?: UploadOptions) => Promise<string>
}
