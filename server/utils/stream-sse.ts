import type { H3Event } from 'h3'

/**
 *  快速 SSE 流式传输助手
 * @param event
 * @param handler
 * @returns
 */
export function streamFastSSE(
  event: H3Event,
  handler: (send: (payload: any) => void) => Promise<void> | void,
) {
  const encoder = new TextEncoder()

  setHeader(event, 'Content-Type', 'text/event-stream; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-cache, no-transform')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'X-Accel-Buffering', 'no')

  return sendStream(
    event,
    new ReadableStream({
      async start(controller) {
        // ✅ 标记此 response 仍然存活
        let closed = false

        const safeSend = (payload: any) => {
          if (closed)
            return
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
            )
          }
          catch {
            // ignore enqueue after close
          }
        }

        try {
          // ✅ 所有异步逻辑必须 await 在这里
          await handler(safeSend)
        }
        catch (err) {
          safeSend({
            event: 'error',
            data : { message: String(err) },
          })
        }
        finally {
          closed = true
          try {
            controller.close()
          }
          catch {}
        }
      },
    }),
  )
}
