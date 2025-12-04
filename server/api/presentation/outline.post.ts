import z from 'zod'
import { streamObject } from 'ai'
import { outlineTemplate } from '~~/server/utils/constants'

const bodySchema = z.object({
  prompt       : z.string(),
  numberOfCards: z.number(),
  language     : z.string().optional().default('en'),
  modelProvider: z.string().optional().default('deepseek'),
  modelId      : z.string().optional().default('deepseek-chat'),
  web          : z.boolean().optional().default(false),
})

export default defineEventHandler(async (event) => {
  // 获取body参数
  const { success, error, data } = bodySchema.safeParse(await readBody<GenerateOutlineReq>(event))

  if (!success) {
    throw createError({
      statusCode   : 400,
      statusMessage: z.prettifyError(error),
      data         : error,
    })
  }

  const { prompt, numberOfCards, language, modelProvider, modelId, web } = data

  const actualLanguage = createLanguageMap[language as keyof typeof createLanguageMap] || language

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year   : 'numeric',
    month  : 'long',
    day    : 'numeric',
  })

  const model = modelPicker(modelProvider, modelId)

  const systemPrompt = outlineTemplate
    .replace(/\{numberOfCards\}/g, numberOfCards.toString())
    .replace(/\{language\}/g, actualLanguage)
    .replace(/\{currentDate\}/g, currentDate)
    .replace(/\{prompt\}/g, prompt)

  const result = streamObject({ model, prompt: systemPrompt, schema: z.object({ title: z.string(), outline: z.string() }) })

  const res = result.toTextStreamResponse()
  return res
})
