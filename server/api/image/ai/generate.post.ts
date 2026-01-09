import * as v from 'valibot'
import { imageModelPicker } from '~~/server/providers/image'
import { nodeCacheDriverName } from '~~/server/providers/storage/nodeCacheDriver'

enum LayoutEnum {
  top        = 'top',
  bottom     = 'bottom',
  left       = 'left',
  right      = 'right',
  background = 'background',
}

// 2. 定义 Schema
const bodySchema = v.object({
  prompt: v.string('Prompt 不能为空'),

  layout: v.optional(v.enum(LayoutEnum, '无效的布局类型'),    LayoutEnum.left),

  modelPicker: v.optional(v.string(), 'volc'),

  modelId: v.optional(v.string(), 'v1'),
})

// 静态配置保持不变
export const WU_ZHONG_LAYOUT = {
  top       : { width: 1280, height: 720 },
  bottom    : { width: 1280, height: 720 },
  left      : { width: 720, height: 1280 },
  right     : { width: 720, height: 1280 },
  background: { width: 1024, height: 1024 },
} as const

export default defineEventHandler(async (event) => {
  // 读取 Body
  const body = await readBody(event)

  // 3. 执行校验
  const { success, output: data, issues } = v.safeParse(bodySchema, body)

  if (!success) {
    throw createError({
      statusCode   : 400,
      statusMessage: 'Validation Failed',
      // 使用 flatten 格式化错误信息
      data         : v.flatten(issues),
    })
  }

  const model = imageModelPicker(data.modelPicker, data.modelId)

  if (!model) {
    throw createError({
      statusCode   : 400,
      statusMessage: 'Invalid image model picker',
    })
  }

  // 使用校验后的数据获取尺寸
  const size = WU_ZHONG_LAYOUT[data.layout as keyof typeof WU_ZHONG_LAYOUT]

  const taskId = await model.generate({
    prompt: data.prompt,
    width : size.width,
    height: size.height,
  })

  const storage = useStorage(nodeCacheDriverName)

  // 存储信息
  await storage.setItem(`AI_IMAGE:${taskId}`, {
    modelPicker: data.modelPicker,
    modelId    : data.modelId || '',
  }, {
    ttl: 600,
  })

  return { taskId }
})
