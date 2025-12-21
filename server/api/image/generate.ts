import z from 'zod'
import { db } from '~~/server/db'
import { getServerSession } from '#auth'
import { ImageLibraryType } from '#shared/prisma/client'
import { imageModelPicker } from '~~/server/providers/image/Index'
import { uploadBufferToOss } from '~~/server/providers/oss/aliyun'

const bodySchema = z.object({
  prompt     : z.string(),
  layout     : z.enum(['top', 'bottom', 'left', 'right', 'background']).optional().default('top'),
  modelPicker: z.string().optional(),
  modelId    : z.string().optional(),
})

export const WU_ZHONG_LAYOUT = {
  top       : { width: 1280, height: 720 },
  bottom    : { width: 1280, height: 720 },
  left      : { width: 720, height: 1280 },
  right     : { width: 720, height: 1280 },
  background: { width: 1024, height: 1024 },
} as const

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user = session!.user
  // 获取body参数
  const { success: success2, error: error2, data  } = bodySchema.safeParse(await readBody(event))

  if (!success2) {
    throw createError({
      statusCode   : 400,
      statusMessage: z.prettifyError(error2),
      data         : error2,
    })
  }
  const model = imageModelPicker(data.modelPicker, data.modelId)

  if (!model) {
    throw createError({
      statusCode   : 400,
      statusMessage: 'Invalid image model picker',
    })
  }

  const size = WU_ZHONG_LAYOUT[data.layout]

  const imageData = await model({
    prompt: data.prompt,
    width : size.width,
    height: size.height,
  })

  const imageUrl = await uploadBufferToOss(imageData, `images/${Date.now()}.png`)

  // 保存到数据库
  await db.imageLibrary.create({
    data: {
      userId  : user.id,
      type    : ImageLibraryType.AI,
      provider: data.modelPicker,
      modelId : data.modelId || null,
      url     : imageUrl,
      prompt  : data.prompt,
    },
  })

  return {
    url: imageUrl,
  }
})
