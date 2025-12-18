import { z } from 'zod'

/**
 * PresentationContext（演示文稿上下文）
 *
 * 作用：
 * - 为所有 slide 提供统一、稳定、轻量的“全局背景”
 * - 不依赖模型记忆，不回传已生成内容
 * - 在 slide-by-slide 生成模式下，保证语义、风格、叙事一致
 *
 * 设计原则：
 * 1. 尽量“少而准”（避免 token 过多导致模型变慢）
 * 2. 完全确定性（不由模型生成，而是程序生成）
 * 3. 所有 slide 共享（每一页复用同一份 context）
 */
export const PresentationContextSchema = z.object({
  /**
   * 演示文稿总标题
   *
   * 来源：
   * - presentation.base.title
   *
   * 用途：
   * - 锚定整体主题，防止后续 slide 偏题
   * - 用于模型理解“这是一场什么主题的演示”
   */
  title: z.string(),

  /**
   * 用户的原始意图 / 输入提示词
   *
   * 来源：
   * - presentation.prompt
   *
   * 用途：
   * - 保留“为什么要做这个演示”
   * - 决定内容侧重点（解释、汇报、说服、教学等）
   *
   * 注意：
   * - 应该是用户原始输入
   * - 不要经过 AI 改写或总结
   */
  userIntent: z.string(),

  /**
   * 演示对象（目标受众）
   *
   * 用途：
   * - 控制用词深浅、解释详细程度
   *
   * 示例：
   * - "General audience"（普通大众）
   * - "Students"（学生）
   * - "Business professionals"（商务人群）
   */
  audience: z.string().default('General audience'),

  /**
   * 输出语言
   *
   * 用途：
   * - 强制模型在所有 slide 中使用统一语言
   *
   * 示例：
   * - "English"
   * - "Chinese"
   * - "Bilingual (English / Chinese)"
   */
  language: z.string().default('English'),

  /**
   * 演示的整体语气 / 风格
   *
   * 用途：
   * - 保证所有 slide 的表达风格一致
   *
   * 示例：
   * - "Professional"（专业）
   * - "Educational"（教学）
   * - "Persuasive"（说服型）
   */
  tone: z.string().default('Professional'),

  /**
   * 关键术语列表（用于全篇统一用词）
   *
   * 用途：
   * - 避免同一概念在不同 slide 中反复换说法
   * - 提升专业性和一致性
   *
   * 设计约束：
   * - 数量要少（<=8）
   * - 只放“必须统一”的术语
   *
   * 示例：
   * - ["Climate change", "Biodiversity", "Ecosystems"]
   */
  terminology: z.array(z.string()).max(8).default([]),

  /**
   * 整个演示的「叙事级大纲」
   *
   * 这是一个非常重要的字段，但经常被误用。
   *
   * ✅ 正确用法：
   * - 每一项对应“一页 slide 的主题”
   * - 用于告诉模型：
   *   “现在在整场故事中的第几步”
   *
   * ❌ 错误用法：
   * - 直接塞完整 markdown
   * - 塞 bullet 详细内容
   *
   * 推荐来源：
   * - 从 markdown outline 中提取标题行（如 ## Heading）
   *
   * 示例：
   * [
   *   "定义问题",
   *   "直接生物影响",
   *   "生态系统层面影响",
   *   "人类行为因素",
   *   "应对与解决方案"
   * ]
   */
  narrativeOutline: z.array(z.string()).min(1),

  /**
   * 总页数
   *
   * 用途：
   * - 让模型理解“整体规模”
   * - 帮助区分引言、中段、结论性 slide
   *
   * 注意：
   * - 应与 narrativeOutline.length 保持一致
   */
  totalSlides: z.number().min(1),
})

export type PresentationContext = z.infer<
  typeof PresentationContextSchema
>

/**
 *  获取上下文文本
 * @param ctx
 * @returns
 */
export function renderPresentationContext(ctx: PresentationContext) {
  return `
Presentation Context:

Title:
${ctx.title}

User Intent:
${ctx.userIntent}

Audience:
${ctx.audience}

Language:
${ctx.language}

Tone:
${ctx.tone}

Preferred Terminology:
${ctx.terminology.length ? ctx.terminology.join(', ') : 'Use consistent terminology'}

Narrative Flow:
${ctx.narrativeOutline.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Total Slides:
${ctx.totalSlides}
`.trim()
}
