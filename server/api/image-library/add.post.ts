import * as v from 'valibot'
import { db } from '~~/server/db'
import { getServerSession } from '#auth'
import { ImageLibraryType } from '~~/prisma/generated/client'

const bodySchema = v.object({
  url: v.string(),
})

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user = session!.user
  // 获取body参数
  const { success, issues, output: data  } = v.safeParse(bodySchema, await readBody(event))

  if (!success) {
    throw createError({
      statusCode   : 400,
      statusMessage: 'Validation Failed',
      data         : v.flatten(issues),
    })
  }

  // 更新传入的字段
  const presentation = await db.imageLibrary.create({
    data: {
      userId: user.id,
      url   : data.url,
      type  : ImageLibraryType.UPLOADED,
    },
  })

  return presentation
})
