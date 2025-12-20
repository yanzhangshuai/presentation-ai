import type { LanguageSupport } from '~~/shared/types/presentation'

import z from 'zod'
import pLimit from 'p-limit'
import { db } from '~~/server/db'
import { generateText } from 'ai'
import { getServerSession } from '#auth'
import { languageSupports } from '#shared/constansts/presentaton'
import { slideNodesPromptTemplate } from '~~/server/utils/ai/prompt'
import {
  PresentationContextSchema,
  renderPresentationContext,
} from '~~/server/utils/presentation-context'

const paramSchema = z.string()

const limit = pLimit(5)
export default defineEventHandler(async (event) => {
  await getServerSession(event)

  const { success, data: id } = paramSchema.safeParse(getRouterParam(event, 'id'))
  if (!success)
    throw createError({ statusCode: 400 })

  const presentation = await db.presentation.findUnique({
    where  : { id },
    include: { base: { select: { title: true } } },
  })

  if (!presentation)
    throw createError({ statusCode: 404 })

  const outline = presentation.outline || []
  const tone = presentation.tone || 'Professional'
  const language = languageSupports[presentation.language as LanguageSupport] || 'English'

  // 解析大纲项
  const topics = outline.map(item => parseMarkdownOutline(item))

  // 选择模型
  const model = modelPicker(
    presentation.modelProvider || 'deepseek',
    presentation.modelId || 'deepseek-chat',
  )

  // 设置上下文，用于关联
  const context = PresentationContextSchema.parse({
    title           : presentation.base.title,
    userIntent      : presentation.prompt || '',
    audience        : 'General audience',
    language,
    tone,
    terminology     : [],
    narrativeOutline: topics.map(t => t.title),
    totalSlides     : outline.length,
  })
  const contextText = renderPresentationContext(context)

  const tasks = topics.map((topic, i) => limit(() => {
    const { title, bullets } = topic

    const prompt = slideNodesPromptTemplate
      .replace('{{CONTEXT}}', contextText)
      .replace('{{SLIDE_INDEX}}', String(i + 1))
      .replace('{{TOTAL_SLIDES}}', String(outline.length))
      .replace('{{NARRATIVE_STEP}}', context.narrativeOutline[i])
      .replace('{{SLIDE_TOPIC}}', title)
      .replace('{{SLIDE_BULLETS}}', bullets.join('\n'))

    return generateSlideSafely({
      model,
      prompt,
      slideTitle: title,
    })
  }))

  return streamFastSSE(event, async (send) => {
  // ✅ 1. 并行生成 slide（这里是 OK 的）
    const slides = await Promise.all(tasks)

    // ✅ 2. 严格串行地发送 slide 和 node
    for (let i = 0; i < slides.length; i++) {
      const slideId = `slide-${i + 1}`
      const slide = slides[i]

      // slide.start
      send({
        event: 'slide.start',
        data : { slideId, layout: slide.layout, rootImageQuery: slide.rootImageQuery },
      })

      // ✅ node streaming（关键：for...of + await）
      for (let j = 0; j < slide.nodes.length; j++) {
        await sleep(80)
        send({
          event: 'node.append',
          data : {
            slideId,
            node: withIds(slideId, slide.nodes[j], j),
          },
        })
      }

      // slide.end
      send({
        event: 'slide.end',
        data : { slideId },
      })
    }
  })
})

interface GenerateSlideParams {
  model     : any
  prompt    : string
  slideTitle: string
}

export async function generateSlideSafely({
  model,
  prompt,
  slideTitle,
}: GenerateSlideParams) {
  try {
    const result = await generateText({ model, prompt })
    return safeParseJson(result.text)
  }
  catch {
    // 🔁 retry once (stronger instruction)
    try {
      const retry = await generateText({
        model,
        prompt: `${prompt}\n\nIMPORTANT: Return RAW JSON ONLY.`,
      })
      return safeParseJson(retry.text)
    }
    catch {
      // 🧯 最终降级方案（永不抛错）
      return {
        layout: 'none',
        nodes : [
          {
            type   : 'heading',
            content: [{ type: 'text', text: slideTitle }],
          },
          {
            type   : 'paragraph',
            content: [
              {
                type: 'text',
                text: '内容生成失败，本页为降级显示。',
              },
            ],
          },
        ],
      }
    }
  }
}

/**
 * 给 ProseMirror 节点补充稳定、可预测的 attrs.id
 *
 * 设计目标：
 * - ID 可读、可调试（不使用随机数）
 * - 对嵌套节点安全（如 columns / list）
 * - 不覆盖模型已有 attrs
 * - 完全确定性（相同输入 → 相同输出）
 *
 * ID 结构：
 *   <slideId>-<nodeType>-<indexPath>
 *
 * 例如：
 *   slide-1-heading-1
 *   slide-1-paragraph-2
 *   slide-1-bullet_list-3-2
 */
export function withIds(
  slideId: string,
  node: any,
  index: number,
  parentPath: number[] = [],
) {
  const currentPath = [...parentPath, index + 1]
  const id = `${slideId}-${node.type}-${currentPath.join('-')}`

  return {
    ...node,

    // 在不覆盖模型 attrs 的情况下补充 id
    attrs: {
      ...(node.attrs || {}),
      id,
    },

    // 递归处理所有子节点
    content: Array.isArray(node.content)
      ? node.content.map((child: any, i: number) =>
          typeof child === 'object'
            ? withIds(slideId, child, i, currentPath)
            : child,
        )
      : node.content,
  }
}
