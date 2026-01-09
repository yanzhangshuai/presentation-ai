import * as v from 'valibot'
import { db } from '~~/server/db'
import { getServerSession } from '#auth'
import { DocumentType, PresentationStatus, PresentationThemeType } from '~~/prisma/generated/client'

// 1. 定义 Schema
const bodySchema = v.object({
  // 必填项
  title: v.pipe(v.string('标题必须是字符串'), v.minLength(1, '标题不能为空')),

  // 可选项 + 默认值：v.optional(schema, defaultValue)
  prompt       : v.optional(v.string(), ''),
  themeId      : v.optional(v.string(), ''),
  language     : v.optional(v.string(), 'zh'),
  imageSource  : v.optional(v.string(), 'stock'),
  modelProvider: v.optional(v.string(), 'deepseek'),
  modelId      : v.optional(v.string(), 'deepseek-chat'),
  pageStyle    : v.optional(v.string(), 'default'),
  numSlides    : v.optional(v.number(), 5),
  tone         : v.optional(v.string(), 'professional'),
})

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const user = session.user

  // 2. 解析 Body 并验证
  const body = await readBody(event)
  const result = v.safeParse(bodySchema, body)

  if (!result.success) {
    throw createError({
      statusCode   : 400,
      statusMessage: 'Validation Failed',
      // 使用 v.flatten 格式化错误
      data         : v.flatten(result.issues),
    })
  }

  // 3. 获取解析后的数据 (Valibot 使用 .output)
  let {
    title,
    themeId,
    language,
    imageSource,
    modelProvider,
    modelId,
    pageStyle,
    numSlides,
    tone,
    prompt,
  } = result.output

  // 4. 业务逻辑：检查主题有效性
  let existTheme = false
  if (themeId) {
    const count = await db.presentationTheme.count({
      where: {
        OR: [
          { id: themeId, type: PresentationThemeType.CUSTOM, userId: user.id },
          { id: themeId, type: PresentationThemeType.SYSTEM, userId: null },
        ],
      },
    })
    existTheme = count > 0
  }

  // 如果主题不存在，获取系统默认主题
  if (!existTheme) {
    const defaultTheme = await db.presentationTheme.findFirst({
      where: {
        type: PresentationThemeType.SYSTEM,
        name: 'Mystique',
      },
      select: { id: true },
    })

    if (defaultTheme) {
      themeId = defaultTheme.id
    }
  }

  // 5. 创建文档和关联的演示文稿
  const presentation = await db.baseDocument.create({
    data: {
      type        : DocumentType.PRESENTATION,
      title       : title || 'Untitled Presentation',
      userId      : user.id,
      presentation: {
        create: {
          doc    : '',
          themeId: themeId || '', // 确保不为 undefined
          language,
          tone,
          imageSource,
          modelProvider,
          modelId,
          pageStyle,
          numSlides,
          prompt,
          outline: [],
          status : PresentationStatus.DRAFT,
        },
      },
    },
    include: {
      presentation: true,
    },
  })

  return presentation
})
