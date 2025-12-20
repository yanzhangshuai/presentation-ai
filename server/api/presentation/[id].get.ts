import z from 'zod'
import { db } from '~~/server/db'
import { getServerSession } from '#auth'

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
      base: {
        userId: user.id,
      },
    },
    include: {
      base : true,
      theme: true,
    },
  })
  if (!presentation)
    throw createError({ statusCode: 404, statusMessage: 'Presentation not found' })

  return presentation
})
