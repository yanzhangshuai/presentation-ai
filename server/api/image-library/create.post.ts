import z from 'zod'
import { db } from '~~/server/db'
import { getServerSession } from '#auth'
import { ImageLibraryType } from '#shared/prisma/client'

const bodySchema = z.object({
  url: z.string(),
})

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user = session!.user
  // 获取body参数
  const { success: success2, error: error2, data: updateData  } = bodySchema.safeParse(await readBody(event))

  if (!success2) {
    throw createError({
      statusCode   : 400,
      statusMessage: z.prettifyError(error2),
      data         : error2,
    })
  }

  // 更新传入的字段
  const presentation = await db.imageLibrary.create({
    data: {
      userId: user.id,
      url   : updateData.url,
      type  : ImageLibraryType.UPLOADED,
    },
  })

  return presentation
})
