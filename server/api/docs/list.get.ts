import type { BaseDocument } from '@prisma/client'

import { z } from 'zod'
import { db } from '~~/server/db'
import { getServerSession } from '#auth'
import { DocumentType } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user = session!.user

  const querySchema = z.object({
    page    : z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().positive().optional().default(10),
  })

  const { success, error, data: query } = querySchema.safeParse(getQuery<PaginationReq>(event))
  if (!success) {
    throw createError({
      statusCode   : 400,
      statusMessage: z.prettifyError(error),
      data         : error,
    })
  }

  const { page, pageSize } = query

  const [items, total] = await Promise.all(
    [
      db.baseDocument.findMany({
        where: {
          userId: user.id,
          type  : DocumentType.PRESENTATION,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),

      db.baseDocument.count(
        { where: {
          userId: user.id,
          type  : DocumentType.PRESENTATION,
        } },
      ),
    ],
  )

  return {
    page,
    pageSize,
    total,
    items,
  } as PaginationRes<BaseDocument>
})
