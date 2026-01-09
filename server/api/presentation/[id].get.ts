import * as v from 'valibot'
import { db } from '~~/server/db'
import { getServerSession } from '#auth'

const paramSchema = v.string()
export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user = session!.user

  const { success, issues, output: id } = v.safeParse(paramSchema, getRouterParam(event, 'id'))
  if (!success) {
    throw createError({
      statusCode   : 400,
      statusMessage: 'Validation Failed',
      data         : v.flatten(issues),
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
