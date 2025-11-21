import { db } from '~~/server/db'
import defineAbilitiesFor from '~~/server/ability/defineAbilities'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid document ID' })
  }

  // 查询数据库获取文档
  const doc = await db.baseDocument.findUnique({
    where: { id },
  })
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found' })
  }

  // 暂时允许所有更新，后续可以添加用户认证
  const ability = defineAbilitiesFor(null)

  if (!ability.can('update', 'BaseDocument')) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const body = await readBody(event)

  const updatedDoc = await db.baseDocument.update({
    where: { id },
    data : body,
  })

  return updatedDoc
})
