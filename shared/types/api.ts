import type { LanguageSupport, ModelProvider } from './presentation'

export interface PaginationReq {
  page    : number
  pageSize: number
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
  theme?        : string
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
  theme?        : string
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

// ---------------- 用户相关 ----------------
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface Account {
  id                       : string
  type                     : string
  provider                 : string
  providerAccountId        : string
  refresh_token?           : string
  access_token?            : string
  expires_at?              : number
  token_type?              : string
  scope?                   : string
  id_token?                : string
  session_state?           : string
  userId                   : string
  refresh_token_expires_in?: number
  user?                    : User
}

export interface User {
  id            : string
  name?         : string
  email?        : string
  password?     : string
  emailVerified?: Date
  image?        : string
  headline?     : string
  language?     : string
  role          : UserRole
  hasAccess     : boolean
  bio?          : string
  interests     : string[]
  location?     : string
  website?      : string
  accounts      : Account[]
  documents     : BaseDocument[]
  favorites     : FavoriteDocument[]
  CustomTheme   : CustomTheme[]
  GeneratedImage: GeneratedImage[]
  createdAt     : Date
  updatedAt     : Date
}

// ---------------- 文档相关 ----------------
export enum DocType {
  NOTE = 'NOTE',
  DOCUMENT = 'DOCUMENT',
  DRAWING = 'DRAWING',
  DESIGN = 'DESIGN',
  STICKY_NOTES = 'STICKY_NOTES',
  MIND_MAP = 'MIND_MAP',
  RAG = 'RAG',
  RESEARCH_PAPER = 'RESEARCH_PAPER',
  FLIPBOOK = 'FLIPBOOK',
  PRESENTATION = 'PRESENTATION',
}

export interface BaseDocument {
  id           : string
  title        : string
  type         : DocType
  isPublic     : boolean
  thumbnailUrl?: string
  documentType : string
  userId       : string
  user?        : User
  createdAt    : Date
  updatedAt    : Date
  presentation?: Presentation
  favorites    : FavoriteDocument[]
}

export enum EPresentationStatus {
  /**
   * 步骤 1：配置完成，但未生成大纲
   */
  DRAFT = 'DRAFT',
  /**
   * 步骤 2：大纲已生成，主题/图片可选
   */
  OUTLINE_GENERATED = 'OUTLINE_GENERATED',
  /**
   * 步骤 3：全部内容生成完成
   */
  CONTENT_GENERATED = 'CONTENT_GENERATED',
  /**
   * AI 生成失败
   */
  FAILED = 'FAILED',
}

// pptx
export interface Presentation {
  id            : string
  content       : string
  theme         : string
  imageSource   : string
  prompt        : string
  modelProvider : ModelProvider
  modelId       : string
  pageStyle     : string
  numSlides     : number
  tone          : string
  language      : LanguageSupport
  outline       : string[]
  searchResults?: any
  base          : BaseDocument
  templateId?   : string
  customThemeId?: string
  customTheme?  : CustomTheme
  status        : EPresentationStatus
}

// ---------------- 主题相关 ----------------
export interface CustomTheme {
  id           : string
  name         : string
  description? : string
  themeData    : any
  logoUrl?     : string
  isPublic     : boolean
  presentations: Presentation[]
  userId       : string
  user?        : User
  createdAt    : Date
  updatedAt    : Date
}

// ---------------- 收藏相关 ----------------
export interface FavoriteDocument {
  id        : string
  documentId: string
  document? : BaseDocument
  userId    : string
  user?     : User
}

// ---------------- AI生成的图片 ----------------
export interface GeneratedImage {
  id       : string
  url      : string
  createdAt: Date
  updatedAt: Date
  userId   : string
  user?    : User
  prompt   : string
}
