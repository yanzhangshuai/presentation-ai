import z from 'zod'
import { db } from '~~/server/db'
import { subject } from '@casl/ability'
import { getServerSession } from '#auth'
import defineAbilitiesFor from '~~/server/ability/defineAbilities'

const paramSchema = z.string()
export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user = session!.user

  const { success, error, data: id } = paramSchema.safeParse(getRouterParam(event, 'id'))
  if (!success) {
    throw createError({
      statusCode   : 400,
      statusMessage: z.prettifyError(error),
      data         : error,
    })
  }

  const presentation = await db.presentation.findUnique({
    where: {
      id,
    },
    include: {
      base       : true,
      customTheme: true,
    },
  })
  if (!presentation)
    throw createError({ statusCode: 404, statusMessage: 'Presentation not found' })

  return {
    ...presentation,
    content: presentation.content as  { slides: unknown[] },
  }
})
