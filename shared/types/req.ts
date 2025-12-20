import type { ModelProvider } from './ai'
import type { LanguageSupport } from './presentation'

export interface PaginationReq {
  page?    : number
  pageSize?: number
}

export interface PaginationRes<T> {
  page    : number
  pageSize: number
  total   : number
  items   : T[]
}

/**
 * 演示创建参数类型
 */
export interface CreatePresentationReq {
  title         : string
  prompt?       : string
  themeId?      : string
  language?     : string
  imageSource   : string
  modelProvider?: string
  modelId?      : string
  pageStyle?    : string
  numSlides?    : number
  tone?         : string

}

/**
 * 演示创建参数类型
 */
export interface EditPresentationReq {
  title?        : string
  prompt?       : string
  themeId?      : string
  language?     : string
  imageSource?  : string
  modelProvider?: string
  modelId?      : string
  pageStyle?    : string
  numSlides?    : number
  tone?         : string
  outline?      : string[]
  content?      : string
}

/**
 * 大纲创建参数类型
 */
export interface GenerateOutlineReq {
  prompt        : string
  numberOfCards : number
  language      : LanguageSupport
  modelProvider?: ModelProvider
  modelId?      : string
  web?          : boolean
}

// ---------------- 主题相关 ----------------

// ---------------- AI生成的图片 ----------------
