import type { BaseDocument } from '~~/prisma/generated/client'

import * as v from 'valibot'
import { db } from '~~/server/db'
import { getServerSession } from '#auth'
import { DocumentType } from '~~/prisma/generated/client'

// 定义 Schema
const querySchema = v.object({
  page: v.pipe(
    v.optional(v.unknown(), '1'), // 默认值为字符串 '1'
    v.transform(input => Number(input)), // 强制转换类型
    v.number('必须是数字'),
    v.integer('必须是整数'),
    v.minValue(1, '最小页码为 1'),
  ),
  pageSize: v.pipe(
    v.optional(v.unknown(), '10'), // 默认值为字符串 '10'
    v.transform(input => Number(input)),
    v.number('必须是数字'),
    v.integer('必须是整数'),
    v.minValue(1, '每页最少 1 条'),
  ),
})

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const user = session.user

  // 解析查询参数
  const { success, output, issues } = v.safeParse(querySchema, getQuery(event))

  if (!success) {
    // 转换错误信息
    throw createError({
      statusCode   : 400,
      statusMessage: 'Invalid Query Parameters',
      data         : v.flatten(issues),
    })
  }

  const { page, pageSize } = output

  const [items, total] = await Promise.all([
    db.baseDocument.findMany({
      where: {
        userId: user.id,
        type  : DocumentType.PRESENTATION,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        presentation: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),

    db.baseDocument.count({
      where: {
        userId: user.id,
        type  : DocumentType.PRESENTATION,
      },
    }),
  ])

  return {
    page,
    pageSize,
    total,
    items,
  }
})
