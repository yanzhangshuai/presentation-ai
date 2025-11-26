import z from 'zod'
import { db } from '~~/server/db'
import { subject } from '@casl/ability'
import { getServerSession } from '#auth'
import defineAbilitiesFor from '~~/server/ability/defineAbilities'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user = session!.user

  const bodySchema = z.object({
    title: z.string(),
  })

  const id = getRouterParam(event, 'id')

  const { success, error, data } = bodySchema.safeParse(await readBody(event))
  if (!success) {
    throw createError({
      statusCode   : 400,
      statusMessage: z.prettifyError(error),
      data         : error,
    })
  }

  const doc = await db.baseDocument.findUnique({
    where: {
      id,
      userId: user.id,
    },
  })
  if (!doc)
    throw createError({ statusCode: 404, statusMessage: 'BaseDocument not found' })

  if (!defineAbilitiesFor(user).can('update', subject('BaseDocument', doc))) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  // 更新title
  return await db.baseDocument.update({
    where: { id },
    data : {
      title: data.title,
    },
  })
})
