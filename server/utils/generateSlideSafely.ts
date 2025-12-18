import { generateText } from 'ai'

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
        layoutHint: 'none',
        nodes     : [
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
