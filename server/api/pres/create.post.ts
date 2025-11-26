import type { InputJsonValue } from '@prisma/client/runtime/client'

import { db } from '~~/server/db'
import { getServerSession } from '#auth'
import { DocumentType  } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user = session!.user

  const data = await readBody<CreatePresentationReq>(event)

  const { title, theme = 'default', language = 'en' } = data

  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required parameters' })
  }

  const presentation = await db.baseDocument.create({
    data: {
      type        : DocumentType.PRESENTATION,
      documentType: 'presentation',
      title       : title ?? 'Untitled Presentation',
      userId      : user.id,
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
})
