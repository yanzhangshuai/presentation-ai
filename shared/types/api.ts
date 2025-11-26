import type { ModelProvider } from './model'
import type { createLanguageMap } from '../utils/presentation'

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
  title    : string
  theme?   : string
  language?: string
}

/**
 * 大纲创建参数类型
 */
export  interface CreateOutlineRes {
  prompt        : string
  numberOfCards : number
  language      : keyof typeof createLanguageMap
  modelProvider?: ModelProvider
  modelId?      : string
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
export enum DocumentType {
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
  type         : DocumentType
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

// pptx
export interface Presentation {
  id                : string
  content           : { slides: any[] }
  theme             : string
  imageSource       : string
  prompt?           : string
  presentationStyle?: string
  language?         : string
  outline           : string[]
  searchResults?    : any
  base              : BaseDocument
  templateId?       : string
  customThemeId?    : string
  customTheme?      : CustomTheme
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
