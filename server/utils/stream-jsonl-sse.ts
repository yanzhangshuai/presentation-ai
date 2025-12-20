// server/utils/streamJsonlFromAIAsSSE.ts
import type { H3Event } from 'h3'

export async function streamJsonlFromAIAsSSE(
  event: H3Event,
  textStream: AsyncIterable<string>,
  options?: {
    onStart?: () => Record<string, unknown> | null
    onEnd?  : () => Record<string, unknown> | null
  },
) {
  const encoder = new TextEncoder()

  // SSE Headers
  setHeader(event, 'Content-Type', 'text/event-stream; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-cache, no-transform')
  setHeader(event, 'Connection', 'keep-alive')

  return sendStream(
    event,
    new ReadableStream({
      async start(controller) {
        try {
          // ----- presentation.start（服务端兜底） -----
          if (options?.onStart) {
            const startPayload = options.onStart()
            if (startPayload) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify(startPayload)}\n\n`,
                ),
              )
            }
          }

          let buffer = ''

          // ----- 主循环：token → JSONL 行 -----
          for await (const chunk of textStream) {
            buffer += chunk

            const lines = buffer.split('\n')
            buffer = lines.pop()! // 保留未完成行

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed)
                continue

              controller.enqueue(
                encoder.encode(
                  `data: ${trimmed}\n\n`,
                ),
              )
            }
          }

          // ----- flush 剩余（防止末尾无换行） -----
          const remaining = buffer.trim()
          if (remaining) {
            controller.enqueue(
              encoder.encode(
                `data: ${remaining}\n\n`,
              ),
            )
          }

          // ----- presentation.end（服务端兜底） -----
          if (options?.onEnd) {
            const endPayload = options.onEnd()
            if (endPayload) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify(endPayload)}\n\n`,
                ),
              )
            }
          }

          controller.close()
        }
        catch (err) {
          // SSE error payload（可选）
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({
                message: err instanceof Error ? err.message : String(err),
              })}\n\n`,
            ),
          )
          controller.close()
        }
      },
    }),
  )
}
