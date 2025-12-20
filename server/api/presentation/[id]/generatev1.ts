import z from 'zod'
import { db } from '~~/server/db'
import { getServerSession } from '#auth'
import { streamObject, streamText } from 'ai'
import { streamJsonlFromAIAsSSE } from '~~/server/utils/stream-jsonl-sse'

const paramSchema = z.string()
export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  // const user = session!.user

  const { success, error, data: id } = paramSchema.safeParse(getRouterParam(event, 'id'))
  if (!success) {
    throw createError({
      statusCode   : 400,
      statusMessage: z.prettifyError(error),
      data         : error,
    })
  }

  const presentation = await db.presentation.findUnique({
    where: {
      id,
    },
    include: {
      base: {
        select: {
          title: true,
        },
      },
    },
  })
  if (!presentation)
    throw createError({ statusCode: 404, statusMessage: 'Presentation not found' })

  const title = presentation.base.title
  const outline = presentation.outline || []
  const prompt = presentation.prompt || ''

  if (!title || !outline?.length || !prompt) {
    throw createError({ statusCode: 400, statusMessage: 'Presentation title or outline is missing' })
  }

  const tone = 'Professional'
  const numSlides = presentation.numSlides || outline.length
  const language = presentation.language || 'zh'
  const modelProvider = presentation.modelProvider || 'deepseek'
  const modelId = presentation.modelId || 'deepseek-chat'

  const searchResultsText = 'No research data available.'
  // if (searchResults && searchResults.length > 0) {
  //   const searchData = searchResults
  //     .map((item, index: number) => {
  //       const query = item.query || `Search ${index + 1}`
  //       const results = Array.isArray(item.results)
  //         ? item.results
  //         : []

  //       if (results.length === 0)
  //         return ''

  //       const formattedResults = results
  //         .map((result: unknown) => {
  //           const resultObj = result as Record<string, unknown>
  //           return `- ${resultObj.title || 'No title'}\n  ${resultObj.content || 'No content'}\n  ${resultObj.url || 'No URL'}`
  //         })
  //         .join('\n')

  //       return `**Search Query ${index + 1}:** ${query}\n**Results:**\n${formattedResults}\n---`
  //     })
  //     .filter(Boolean)
  //     .join('\n\n')

  //   if (searchData) {
  //     searchResultsText = `The following research was conducted during outline generation:\n\n${searchData}`
  //   }
  // }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year   : 'numeric',
    month  : 'long',
    day    : 'numeric',
  })
  const model = modelPicker(modelProvider, modelId)

  const formattedPrompt = slidesTemplate
    .replace(/\{TITLE\}/g, presentation.base.title || 'Untitled Presentation')
    .replace(/\{PROMPT\}/g, prompt || 'No specific prompt provided')
    .replace(/\{CURRENT_DATE\}/g, currentDate)
    .replace(/\{LANGUAGE\}/g, language)
    .replace(/\{TONE\}/g, tone)
    .replace(/\{OUTLINE_FORMATTED\}/g, outline.join('\n\n'))
    .replace(/\{TOTAL_SLIDES\}/g, numSlides.toString())
    .replace(/\{SEARCH_RESULTS\}/g, searchResultsText)

  const result  = streamText({ model, prompt: formattedPrompt })

  return streamJsonlFromAIAsSSE(
    event,
    result.textStream,
    {
      onStart: () => ({
        event      : '',
        totalSlides: outline.length,
      }),

    },
  )
})
