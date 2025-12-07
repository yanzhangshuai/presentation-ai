import type { InputJsonValue } from '@prisma/client/runtime/client'

import z from 'zod'
import { db } from '~~/server/db'
import { subject } from '@casl/ability'
import { getServerSession } from '#auth'
import defineAbilitiesFor from '~~/server/ability/defineAbilities'

const paramSchema = z.string()

const bodySchema = z.object({
  title            : z.string().optional(),
  theme            : z.string().optional(),
  language         : z.string().optional(),
  imageSource      : z.string().optional(),
  modelProvider    : z.string().optional(),
  modelId          : z.string().optional(),
  pageStyle        : z.string().optional(),
  numSlides        : z.number().optional(),
  presentationStyle: z.string().optional(),
  prompt           : z.string().optional(),
  outline          : z.array(z.string()).optional(),
}).transform(obj =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null),
  ),
)

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user = session!.user

  // Parse URL parameter
  const { success: success1, error: error1, data: id } = paramSchema.safeParse(getRouterParam(event, 'id'))
  if (!success1) {
    throw createError({
      statusCode   : 400,
      statusMessage: z.prettifyError(error1),
      data         : error1,
    })
  }

  // 获取body参数
  const { success: success2, error: error2, data: updateData  } = bodySchema.safeParse(await readBody<EditPresentationReq>(event))

  if (!success2) {
    throw createError({
      statusCode   : 400,
      statusMessage: z.prettifyError(error2),
      data         : error2,
    })
  }

  if (updateData.title) {
    // @ts-expect-error 特殊处理
    updateData.base = { update: { title: updateData.title } }
    delete updateData.title
  }

  // TODO: 权限检查
  // if (!defineAbilitiesFor(user).can('update', subject('Presentation', { id }))) {
  //   throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  // }

  // 更新传入的字段
  const presentation = await db.presentation.update({
    where: { id },
    data : updateData,
  })

  return presentation
})
