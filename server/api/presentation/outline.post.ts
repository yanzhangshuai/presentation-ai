import { streamText } from 'ai'
import { outlineTemplate } from '~~/server/utils/constants'

export default defineEventHandler(async (event) => {
  try {
    // 获取body参数
    const data = await readBody<CreateOutlineType>(event)

    console.log('data', data)

    const { prompt, numberOfCards, language, modelProvider = 'openai', modelId } = data

    if (!prompt || !numberOfCards || !language) {
      throw createError({ statusCode: 400, statusMessage: 'Missing required parameters' })
    }

    const actualLanguage = createLanguageMap[language] || language

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

    const result = streamText({ model, prompt: systemPrompt })

    return result.toTextStreamResponse()
  }
  catch (error: any) {
    console.error('生成大纲失败', error)
    throw createError({ statusCode: 500, statusMessage: '生成大纲失败' })
  }
})
