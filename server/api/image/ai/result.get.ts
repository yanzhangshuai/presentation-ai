import * as v from 'valibot'
import { db } from '~~/server/db'
import { getServerSession } from '#auth'
import { imageModelPicker } from '~~/server/providers/image'
import { ImageLibraryType } from '~~/prisma/generated/client'
import { uploadBufferToOss } from '~~/server/providers/oss/Aliyun'
import { nodeCacheDriverName } from '~~/server/providers/storage/nodeCacheDriver'

const querySchema = v.object({
  taskId: v.string(),
})

export default defineEventHandler<Promise<ImageTaskRes>>(async (event) => {
  const session = await getServerSession(event)
  const user = session!.user

  const { success, output: query, issues } = v.safeParse(querySchema, getQuery(event))

  if (!success) {
    throw createError({
      statusCode   : 400,
      statusMessage: 'Validation Failed',
      data         : v.flatten(issues),
    })
  }

  const storage = useStorage<{ [key: string]: string }>(nodeCacheDriverName)

  const provider =  await storage.getItem<{
    modelPicker: string
    modelId    : string
  }>(`AI_IMAGE:${query.taskId}`)

  if (!provider) {
    throw createError({
      statusCode   : 404,
      statusMessage: 'Image provider info not found for the given task ID',
    })
  }

  const model = imageModelPicker(provider.modelPicker, provider.modelId)

  if (!model) {
    throw createError({
      statusCode   : 400,
      statusMessage: 'Invalid image model picker',
    })
  }

  const result = await model.getTaskResult(query.taskId)

  if (result.status === 'FAILED') {
    return {
      status : 'failed',
      message: result.message || 'Image generation failed',
    }
  }

  if (result.status === 'SUCCEEDED' && result.blob) {
    // 上传图片到OSS
    const url = await uploadBufferToOss(result.blob, `images/${Date.now()}.png`)

    // 保存到数据库
    await db.imageLibrary.create({
      data: {
        userId  : user.id,
        type    : ImageLibraryType.AI,
        provider: provider.modelPicker,
        modelId : provider.modelId || null,
        url,
        prompt  : '', // 这里可以根据需要保存提示词
      },
    })

    return {
      status: 'succeeded',
      url,
    }
  }

  if (result.status === 'SUCCEEDED' && !result.blob) {
    return { status: 'failed', message: 'No image data found' }
  }

  return { status: 'running' }
})

type ImageTaskRes = {
  status: 'running'
}
| {
  status: 'succeeded'
  url   : string
}
| {
  status : 'failed'
  message: string
}
