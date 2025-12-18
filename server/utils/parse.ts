export interface ParsedOutlineItem {
  title  : string
  bullets: string[]
}

/**
 *  解析 Markdown 大纲
 * @param md
 * @returns
 */
export function parseMarkdownOutline(md: string): ParsedOutlineItem {
  const lines = md
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)

  const title
    = lines.find(l => l.startsWith('#'))?.replace(/^#+\s*/, '')
      ?? lines[0]

  const bullets = lines
    .filter(l => l.startsWith('- ') || l.startsWith('* '))
    .map(l => l.replace(/^[-*]\s*/, ''))

  return {
    title,
    bullets,
  }
}

/**
 * 安全解析 JSON 字符串，支持去除代码块标记
 * @param text
 * @returns
 */
export function safeParseJson(text: string) {
  let clean = text.trim()

  if (clean.startsWith('```')) {
    clean = clean
      .replace(/^```[a-z]*\s*/i, '')
      .replace(/\s*```$/, '')
      .trim()
  }

  return JSON.parse(clean)
}
