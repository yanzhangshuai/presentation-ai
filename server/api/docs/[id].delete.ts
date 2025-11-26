import { db } from '~~/server/db'
import { subject } from '@casl/ability'
import { getServerSession } from '#auth'
import defineAbilitiesFor from '~~/server/ability/defineAbilities'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user = session!.user

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid document ID' })
  }

  const doc = await db.baseDocument.findUnique({
    where: {
      id,
      userId: user.id,
    },
  })
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'BaseDocument not found' })
  }

  if (!defineAbilitiesFor(user).can('delete', subject('BaseDocument', doc))) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  // 刪除
  return await db.baseDocument.delete({
    where: { id },
  })
})
