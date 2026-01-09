import * as v from 'valibot'
import { db } from '~~/server/db'
import { subject } from '@casl/ability'
import { getServerSession } from '#auth'
import defineAbilitiesFor from '~~/server/ability/defineAbilities'

const bodySchema = v.object({
  title: v.string('标题必须是字符串'),
})

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const user = session.user

  const id = getRouterParam(event, 'id')

  // 2. 解析 Body 并验证
  const body = await readBody(event)
  const { success, output, issues } = v.safeParse(bodySchema, body)

  // 3. 处理错误
  if (!success) {
    throw createError({
      statusCode   : 400,
      statusMessage: 'Validation Failed',
      data         : v.flatten(issues),
    })
  }

  // 4. 获取验证后的数据 (Valibot 使用 .output 而不是 .data)
  const validatedData = output

  const doc = await db.baseDocument.findUnique({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'BaseDocument not found' })
  }

  if (!defineAbilitiesFor(user).can('update', subject('BaseDocument', doc))) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  // 更新 title
  return await db.baseDocument.update({
    where: { id },
    data : {
      title: validatedData.title,
    },
  })
})
