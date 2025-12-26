import type { LanguageSupport } from '~~/shared/types/presentation'

import z from 'zod'
import pLimit from 'p-limit'
import { streamText } from 'ai'
import { db } from '~~/server/db'
import { getServerSession } from '#auth'
import { languageSupports } from '#shared/constansts/presentaton'
import { slideNodesPromptTemplate } from '~~/server/utils/ai/prompt'
import {
  PresentationContextSchema,
  renderPresentationContext,
} from '~~/server/utils/presentationContext'

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
  const language
    = languageSupports[presentation.language as LanguageSupport] || 'English'

  const topics = outline.map(item => parseMarkdownOutline(item))

  const model = modelPicker(
    presentation.modelProvider || 'deepseek',
    presentation.modelId || 'deepseek-chat',
  )

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

  return streamFastSSE(event, async (send) => {
    const buffers: Record<
      number,
      {
        slideId  : string
        json     : any | null
        sentCount: number
        metaSent : boolean
        done     : boolean
      }
    > = {}

    let currentIndex = 0

    const tasks = topics.map((topic, i) =>
      limit(async () => {
        const slideIndex = i
        const slideId = `slide-${i + 1}`

        buffers[slideIndex] = {
          slideId,
          json     : null,
          sentCount: 0,
          metaSent : false,
          done     : false,
        }

        const prompt = slideNodesPromptTemplate
          .replace('{{CONTEXT}}', contextText)
          .replace('{{SLIDE_INDEX}}', String(i + 1))
          .replace('{{TOTAL_SLIDES}}', String(outline.length))
          .replace('{{NARRATIVE_STEP}}', context.narrativeOutline[i])
          .replace('{{SLIDE_TOPIC}}', topic.title)
          .replace('{{SLIDE_BULLETS}}', topic.bullets.join('\n'))

        let buffer = ''
        const result = await streamText({ model, prompt })

        for await (const chunk of result.textStream) {
          buffer += chunk
          const json = tryParseJson(buffer)

          if (json) {
            buffers[slideIndex].json = json
            flush()
          }
        }

        buffers[slideIndex].done = true
        flush()
      }),
    )

    function flush() {
      while (buffers[currentIndex]) {
        const entry = buffers[currentIndex]
        if (!entry || !entry.json)
          break

        if (!entry.metaSent) {
          entry.metaSent = true
          send({
            event: 'slide.start',
            data : {
              slideId       : entry.slideId,
              layout        : entry.json.layout,
              rootImageQuery: entry.json.rootImageQuery,
            },
          })
        }

        while (entry.sentCount < entry.json.nodes.length) {
          send({
            event: 'node.append',
            data : {
              slideId: entry.slideId,
              node   : withIds(
                entry.slideId,
                entry.json.nodes[entry.sentCount],
                entry.sentCount,
              ),
            },
          })
          entry.sentCount++
        }

        if (entry.done) {
          send({
            event: 'slide.end',
            data : { slideId: entry.slideId },
          })
          delete buffers[currentIndex]
          currentIndex++
        }
        else {
          break
        }
      }
    }

    await Promise.all(tasks)
  })
})

function tryParseJson(text: string) {
  try {
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const json = JSON.parse(cleaned)
    return json?.layout && Array.isArray(json.nodes) ? json : null
  }
  catch {
    return null
  }
}

export function withIds(
  slideId: string,
  node: any,
  index: number,
  parentPath: number[] = [],
) {
  const currentPath = [...parentPath, index + 1]

  return {
    ...node,
    attrs: {
      ...(node.attrs || {}),
    },
    content: Array.isArray(node.content)
      ? node.content.map((child: any, i: number) =>
          typeof child === 'object'
            ? withIds(slideId, child, i, currentPath)
            : child,
        )
      : node.content,
  }
}
