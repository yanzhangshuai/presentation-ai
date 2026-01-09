import * as v from 'valibot'
import { db } from '~~/server/db'
import { getServerSession } from '#auth'
import { PresentationStatus } from '~~/prisma/generated/client'

// 1. 定义 Schema
const paramSchema = v.string('Invalid ID')

const bodySchema = v.pipe(
  v.object({
    title        : v.optional(v.string()),
    themeId      : v.optional(v.string()),
    language     : v.optional(v.string()),
    imageSource  : v.optional(v.enum({ ai: 'ai', stock: 'stock' })),
    imageProvider: v.optional(v.string()),
    imageModelId : v.optional(v.string()),
    modelProvider: v.optional(v.string()),
    modelId      : v.optional(v.string()),
    pageStyle    : v.optional(v.string()),
    numSlides    : v.optional(v.number()),
    tone         : v.optional(v.string()),
    prompt       : v.optional(v.string()),
    outline      : v.optional(v.array(v.string())),
    doc          : v.optional(v.string()),
  }),
  // 模拟 .transform(): 过滤掉 undefined 和 null 的键值对
  v.transform((input) => {
    return Object.fromEntries(
      Object.entries(input).filter(([_, val]) => val !== undefined && val !== null),
    )
  }),
)

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const user = session.user

  // 2. 解析 URL 参数
  const paramResult = v.safeParse(paramSchema, getRouterParam(event, 'id'))

  if (!paramResult.success) {
    throw createError({
      statusCode   : 400,
      statusMessage: 'Invalid ID parameter',
      data         : v.flatten(paramResult.issues),
    })
  }
  const id = paramResult.output

  // 3. 获取并解析 Body 参数
  const body = await readBody(event)
  const bodyResult = v.safeParse(bodySchema, body)

  if (!bodyResult.success) {
    throw createError({
      statusCode   : 400,
      statusMessage: 'Validation Failed',
      data         : v.flatten(bodyResult.issues),
    })
  }

  // Valibot 的转换结果存放在 output 中
  // 这里需要手动处理类型断言，因为 transform 会改变对象结构
  const updateData = bodyResult.output as any

  // 4. 业务逻辑处理 (保留原逻辑)
  if (updateData.title) {
    updateData.base = { update: { title: updateData.title } }
    delete updateData.title
  }

  if (updateData.outline?.length) {
    updateData.status = PresentationStatus.OUTLINE
  }

  if (updateData.doc) {
    updateData.status = PresentationStatus.DOC
  }

  if (updateData.themeId) {
    updateData.theme = { connect: { id: updateData.themeId } }
    delete updateData.themeId
  }

  // 5. 执行数据库更新
  const presentation = await db.presentation.update({
    where: {
      id,
      base: {
        userId: user.id,
      },
    },
    data: updateData,
  })

  return presentation
})
