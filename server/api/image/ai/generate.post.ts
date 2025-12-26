import z from 'zod'
import { imageModelPicker } from '~~/server/providers/image'
import { nodeCacheDriverName } from '~~/server/providers/storage/nodeCacheDriver'

const bodySchema = z.object({
  prompt     : z.string(),
  layout     : z.enum(['top', 'bottom', 'left', 'right', 'background']).optional().default('top'),
  modelPicker: z.string().optional().default('volc'),
  modelId    : z.string().optional().default('v1'),
})

export const WU_ZHONG_LAYOUT = {
  top       : { width: 1280, height: 720 },
  bottom    : { width: 1280, height: 720 },
  left      : { width: 720, height: 1280 },
  right     : { width: 720, height: 1280 },
  background: { width: 1024, height: 1024 },
} as const

export default defineEventHandler(async (event) => {
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
  const taskId = await model.generate({
    prompt: data.prompt,
    width : size.width,
    height: size.height,
  })

  const storage = useStorage<{ [key: string]: string }>(nodeCacheDriverName)

  await storage.setItem(`AI_IMAGE:${taskId}`, {
    modelPicker: data.modelPicker,
    modelId    : data.modelId || '',
  }, {
    ttl: 600,
  })

  return { taskId }
})
