import type { BaseDocument } from './base-document'
import type { PresentationTheme } from './presentation-theme'

export interface Presentation {
  id           : string
  content      : string
  imageSource  : string
  imageProvider: string
  imageModelId : string
  prompt       : string | null
  modelProvider: string | null
  modelId      : string | null
  pageStyle    : string | null
  numSlides    : number | null
  tone         : string | null
  language     : string | null
  outline      : string[]
  searchResults: any
  status       : PresentationStatus
  templateId   : string | null
  themeId      : string
  theme        : PresentationTheme
  base         : BaseDocument
}

export enum PresentationStatus  {
  Draft  = 'DRAFT',
  Outline = 'OUTLINE',
  Content = 'CONTENT',
  Failed = 'FAILED',
}

export type LayoutType = 'left' | 'right' | 'top' | 'bottom' | 'background' | 'none'

export interface SlideDoc {
  type   : 'doc'
  content: SlideNode[]
}

export interface PresentationDoc {
  id          : string
  title       : string
  description?: string
  slides      : PresentationSlide[]
  createdAt   : number
  updatedAt   : number
}

/** 幻灯片 */
export interface PresentationSlide {
  id        : string
  layout    : LayoutType
  rootImage?: RootImage
  content   : SlideNode[]
  alignment?: 'start' | 'center' | 'end'
  bgColor?  : string
  width?    : 'S' | 'M' | 'L'
}

/**
 * 根图片信息
 */
export interface RootImage extends Record<string, any> {
  query        : string
  url?         : string
  cropSettings?: ImageCropSettings
  layoutType?  : LayoutType
  size?        : { w?: string, h?: number }
}

export interface ImageCropSettings {
  objectFit     : 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  objectPosition: { x: number, y: number }
  // Zoom level for pan/zoom cropping. Defaults to 1 when omitted.
  zoom?         : number
}

export type SlideNode
  = | HeadingNode
    | ParagraphNode
    | ImageNode
    | ColumnsNode
    | BulletListNode
    | OrderedListNode

export interface TextNode {
  type: 'text'
  text: string
}
export interface HeadingNode {
  type : 'heading'
  attrs: {
    id   : string
    level: 1 | 2 | 3 | 4 | 5 | 6
  }
  content: TextNode[]
}

/**
 * 段落节点
 */
export interface ParagraphNode {
  type : 'paragraph'
  attrs: {
    id: string
  }
  content: TextNode[]
}

/**
 * 图片节点
 */
export interface ImageNode {
  type : 'image'
  attrs: {
    id       : string
    query    : string
    status   : 'placeholder' | 'generated' | 'failed'
    imageUrl?: string
  }
}

/**
 * 多列节点
 */
export interface ColumnsNode {
  type : 'columns'
  attrs: {
    id   : string
    count: number
  }
  content: SlideNode[] // column 内依然是合法 node
}

/**
 * 列表节点
 */
export interface ListItemNode {
  type   : 'listItem'
  content: ParagraphNode[]
}

/**
 * 无序列表节点
 */
export interface BulletListNode {
  type : 'bulletList'
  attrs: {
    id: string
  }
  content: ListItemNode[]
}

/**
 * 有序列表节点
 */
export interface OrderedListNode {
  type : 'orderedList'
  attrs: {
    id   : string
    order: number
  }
  content: ListItemNode[]
}
