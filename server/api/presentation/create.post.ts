import type { InputJsonValue } from '@prisma/client/runtime/client'

import z from 'zod'
import { db } from '~~/server/db'
import { getServerSession } from '#auth'

const bodySchema = z.object({
  title            : z.string(),
  prompt           : z.string().optional().default(''),
  theme            : z.string().optional().default('Mystique'),
  language         : z.string().optional().default('en'),
  imageSource      : z.string().optional().default('stock'),
  modelProvider    : z.string().optional().default('deepseek'),
  modelId          : z.string().optional().default('deepseek-chat'),
  pageStyle        : z.string().optional().default('default'),
  numSlides        : z.number().optional().default(5),
  presentationStyle: z.string().optional().default('professional'),
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

  const { title, theme, language, imageSource, modelProvider, modelId, pageStyle, numSlides, presentationStyle, prompt } = data

  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required parameters' })
  }

  const presentation = await db.baseDocument.create({
    data: {
      type        : DocType.PRESENTATION,
      documentType: 'presentation',
      title       : title ?? 'Untitled Presentation',
      userId      : user.id,
      presentation: {
        create: {
          content: { slides: [] } as unknown as InputJsonValue,
          theme,
          language,
          presentationStyle,
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
