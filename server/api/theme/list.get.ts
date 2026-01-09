import type { Prisma } from '~~/prisma/generated/client'

import * as v from 'valibot'
import { db } from '~~/server/db'
import { getServerSession } from '#auth'
import { PresentationThemeType } from '~~/prisma/generated/client'

// 1. 定义 Schema
const querySchema = v.object({
  // Prisma Enum 校验
  type: v.optional(v.enum(PresentationThemeType)),

  // 分页参数：getQuery 获取的是字符串，需要 Pipe + Transform 模拟 z.coerce.number()
  page: v.pipe(
    v.optional(v.number(), 1), // 默认值设为字符串 '1'
    v.transform(val => Number(val)), // 转换为数字
    v.number('Page must be a number'),
    v.integer(),
    v.minValue(1),
  ),

  pageSize: v.pipe(
    v.optional(v.number(), 10),
    v.transform(val => Number(val)),
    v.number('PageSize must be a number'),
    v.integer(),
    v.minValue(1),
  ),
})

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user = session?.user

  // 2. 解析 Query 参数
  const { success, output: query, issues } = v.safeParse(querySchema, getQuery(event))

  if (!success) {
    throw createError({
      statusCode   : 400,
      statusMessage: 'Invalid Query Parameters',
      data         : v.flatten(issues), // 返回格式化的错误详情
    })
  }

  const { page, pageSize } = query

  // 3. 构建 Prisma Where 条件 (逻辑保持不变)
  const where: Prisma.PresentationThemeWhereInput = (() => {
    if (query.type === PresentationThemeType.CUSTOM) {
      if (!user)
        throw createError({ statusCode: 401 })
      return {
        type  : PresentationThemeType.CUSTOM,
        userId: user.id,
      }
    }

    if (query.type === PresentationThemeType.SYSTEM) {
      return {
        type  : PresentationThemeType.SYSTEM,
        userId: null,
      }
    }

    // 默认情况：混合模式，必须登录
    if (!user)
      throw createError({ statusCode: 401 })

    return {
      OR: [
        {
          type  : PresentationThemeType.CUSTOM,
          userId: user.id,
        },
        {
          type  : PresentationThemeType.SYSTEM,
          userId: null,
        },
      ],
    }
  })()

  // 4. 并发查询数据和总数
  const [items, total] = await Promise.all([
    db.presentationTheme.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip   : (page - 1) * pageSize,
      take   : pageSize,
    }),

    db.presentationTheme.count({ where }),
  ])

  return { page, pageSize, total, items }
})
