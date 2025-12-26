import type { BaseDocument } from './base-document'
import type { PresentationTheme } from './presentation-theme'

export interface Presentation {
  id           : string
  doc          : string
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
  Doc = 'DOC',
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
  doc       : SlideDoc
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
    | PColumnsNode
    | PColumnNode
    | PListNode
    | PListItemNode
    | BulletListNode
    | OrderedListNode
    | ListItemNode
    | TextNode

export interface TextNode {
  type  : 'text'
  text  : string
  marks?: Array<{
    type  : 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'link' | 'generating'
    attrs?: {
      href?  : string
      title? : string
      target?: string
    }
  }>
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
export interface PColumnsNode {
  type : 'p_columns'
  attrs: {
    id       : string
    count    : number
    width?   : 'S' | 'M' | 'L'
    direction: 'vertical' | 'horizontal'
  }
  content: PColumnNode[]
}

export interface PColumnNode {
  type : 'p_column'
  attrs: {
    id   : string
    index: number
  }
  content: (ParagraphNode | HeadingNode)[]
}

/**
 * [1][2][3]节点
 */
export interface PListNode {
  type : 'p_list'
  attrs: {
    id       : string
    count    : number
    width?   : 'S' | 'M' | 'L'
    direction: 'vertical' | 'horizontal'
  }
  content: PListItemNode[]
}

export interface PListItemNode {
  type : 'p_list_item'
  attrs: {
    id   : string
    index: number
  }
  content: (ParagraphNode | HeadingNode)[]
}

/**
 * 列表节点
 */
export interface ListItemNode {
  type : 'list_item'
  attrs  : {
    id       : string
    index    : number
    styleType: 'disc' | 'decimal'
  }
  content: (ParagraphNode | HeadingNode)[]
}

/**
 * 无序列表节点
 */
export interface BulletListNode {
  type : 'bullet_list'
  attrs: {
    id       : string
    count    : number
    direction: 'vertical' | 'horizontal'
  }
  content: ListItemNode[]
}

/**
 * 有序列表节点
 */
export interface OrderedListNode {
  type : 'ordered_list'
  attrs: {
    id   : string
    order: number
  }
  content: ListItemNode[]
}
