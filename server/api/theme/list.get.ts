import type { Prisma } from '@prisma/client'

import { z } from 'zod'
import { db } from '~~/server/db'
import { getServerSession } from '#auth'
import { PresentationThemeType } from '@prisma/client'

const querySchema = z.object({
  type    : z.enum(PresentationThemeType).optional(),
  page    : z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().optional().default(10),
})

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user = session?.user

  const { success, error, data: query } = querySchema.safeParse(getQuery(event))

  if (!success) {
    throw createError({
      statusCode   : 400,
      statusMessage: z.prettifyError(error),
    })
  }

  const { page, pageSize } = query

  const where: Prisma.PresentationThemeWhereInput = (() => {
    if (query.type === PresentationThemeType.CUSTOM) {
      if (!user)
        throw createError({ statusCode: 401 })
      return {
        type  : PresentationThemeType.CUSTOM,
        userId: user.id,
      }
    }

    if (query.type === PresentationThemeType.SYSTEM) {
      return {
        type  : PresentationThemeType.SYSTEM,
        userId: null,
      }
    }

    if (!user)
      throw createError({ statusCode: 401 })

    return {
      OR: [
        {
          type  : PresentationThemeType.CUSTOM,
          userId: user.id,
        },
        {
          type  : PresentationThemeType.SYSTEM,
          userId: null,
        },
      ],
    }
  })()

  const [items, total] = await Promise.all([
    db.presentationTheme.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip   : (page - 1) * pageSize,
      take   : pageSize,
    }),

    db.presentationTheme.count({ where }),
  ])

  return { page, pageSize, total, items }
})
