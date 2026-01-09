import * as v from 'valibot'
import { streamText } from 'ai'
// 假设这些是你的工具函数或模板
// import { modelPicker } from '~~/server/utils/model'
// import { outlinePromptTemplate } from '~~/server/utils/prompts'

const bodySchema = v.object({
  prompt   : v.pipe(v.string('Prompt is required'), v.minLength(1)),
  numSlides: v.number('numSlides must be a number'),

  // v.optional(schema, defaultValue)
  language     : v.optional(v.string(), '简体中文'),
  modelProvider: v.optional(v.string(), 'deepseek'),
  modelId      : v.optional(v.string(), 'deepseek-chat'),
  web          : v.optional(v.boolean(), false),
})

export default defineEventHandler(async (event) => {
  // 1. 读取并校验 Body
  const { success, output: data, issues } = v.safeParse(bodySchema, await readBody(event))

  if (!success) {
    throw createError({
      statusCode   : 400,
      statusMessage: 'Validation Failed',
      data         : v.flatten(issues),
    })
  }

  // 2. 获取校验后的数据 (Valibot 使用 .output)
  const {
    prompt,
    numSlides,
    language,
    modelProvider,
    modelId,
    web,
  } = data

  // 3. 准备 AI 生成所需的上下文
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year   : 'numeric',
    month  : 'long',
    day    : 'numeric',
  })

  // 获取 AI 模型实例
  const model = modelPicker(modelProvider, modelId)

  // 替换 Prompt 模板中的变量
  const systemPrompt = outlinePromptTemplate
    .replace(/\{numberOfCards\}/g, numSlides.toString())
    .replace(/\{language\}/g, language)
    .replace(/\{currentDate\}/g, currentDate)
    .replace(/\{prompt\}/g, prompt)

  // 4. 调用 AI SDK 进行流式生成
  const result = streamText({
    model,
    prompt: systemPrompt,
    // 如果 web 为 true，可以在这里添加工具调用或其他逻辑
  })

  // 5. 返回文本流响应
  return result.toTextStreamResponse()
})
