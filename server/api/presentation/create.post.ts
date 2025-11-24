import type { InputJsonValue } from '@prisma/client/runtime/client'

import { db } from '~~/server/db'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  try {
    const data = await readBody<CreatePresentationType>(event)

    const { title, theme = 'default', language = 'en' } = data

    if (!title) {
      throw createError({ statusCode: 400, statusMessage: 'Missing required parameters' })
    }

    const session = await getServerSession(event)

    const userId = session!.user.id!

    const presentation = await db.baseDocument.create({
      data: {
        type        : 'PRESENTATION',
        documentType: 'presentation',
        title       : title ?? 'Untitled Presentation',
        userId,
        presentation: {
          create: {
            content: { slides: [] } as unknown as InputJsonValue,
            theme,
            language,
          },
        },
      },
      include: {
        presentation: true,
      },
    })

    return presentation
  }
  catch (error: any) {
    console.error('创建演示失败', error)
    throw createError({ statusCode: 500, statusMessage: '创建演示失败' })
  }
})
