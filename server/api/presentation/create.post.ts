import z from 'zod'
import { db } from '~~/server/db'
import { getServerSession } from '#auth'
import  { DocumentType, PresentationStatus, PresentationThemeType } from '@prisma/client'

const bodySchema = z.object({
  title        : z.string(),
  prompt       : z.string().optional().default(''),
  themeId      : z.string().optional().default(''),
  language     : z.string().optional().default('zh'),
  imageSource  : z.string().optional().default('stock'),
  modelProvider: z.string().optional().default('deepseek'),
  modelId      : z.string().optional().default('deepseek-chat'),
  pageStyle    : z.string().optional().default('default'),
  numSlides    : z.number().optional().default(5),
  tone         : z.string().optional().default('professional'),
})

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user = session!.user

  // 获取body参数
  const { success, error, data } = bodySchema.safeParse(await readBody<CreatePresentationReq>(event))

  if (!success) {
    throw createError({
      statusCode   : 400,
      statusMessage: z.prettifyError(error),
      data         : error,
    })
  }

  let { title, themeId, language, imageSource, modelProvider, modelId, pageStyle, numSlides, tone, prompt } = data

  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required parameters' })
  }

  // 检查 theme 是否有效
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

  if (!existTheme) {
    const defaultTheme = await db.presentationTheme.findFirst({
      where: {
        type: PresentationThemeType.SYSTEM,
        name: 'Mystique', // 如果不需要空格，删掉尾部空格
      },
      select: { id: true },
    })

    themeId = defaultTheme!.id
  }

  const presentation = await db.baseDocument.create({
    data: {
      type        : DocumentType.PRESENTATION,
      title       : title ?? 'Untitled Presentation',
      userId      : user.id,
      presentation: {
        create: {
          content: '',
          themeId,
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
