import type { ModelProvider } from './model'
import type { createLanguageMap } from '../utils/presentation'

/**
 * 演示创建参数类型
 */
export interface CreatePresentationType {
  title    : string
  theme?   : string
  language?: string
}

/**
 * 大纲创建参数类型
 */
export  interface CreateOutlineType {
  prompt        : string
  numberOfCards : number
  language      : keyof typeof createLanguageMap
  modelProvider?: ModelProvider
  modelId?      : string
}

export interface PlateSlide {
  id         : string
  content    : any[]
  rootImage? : any
  layoutType?: 'left' | 'right' | 'vertical' | 'background' | undefined
  alignment? : 'start' | 'center' | 'end'
  bgColor?   : string
  width?     : 'S' | 'M' | 'L'
}

// export type PlateNode
//   = | ParagraphElement
//     | HeadingElement
//     | ImageElement
//     | TColumnElement
//     | TColumnGroupElement
//     | TBulletGroupElement
//     | TBulletItemElement
//     | TIconListItemElement
//     | TIconListElement
//     | TIconElement
//     | TCycleGroupElement
//     | TCycleItemElement
//     | TStairItemElement
//     | TStairGroupElement
//     | TPyramidGroupElement
//     | TPyramidItemElement
//     | TArrowListElement
//     | TArrowListItemElement
//     | TTimelineGroupElement
//     | TTimelineItemElement
//     | TChartElement
//   // New components
//     | TBoxGroupElement
//     | TBoxItemElement
//     | TCompareGroupElement
//     | TCompareSideElement
//     | TBeforeAfterGroupElement
//     | TBeforeAfterSideElement
//     | TProsConsGroupElement
//     | TProsItemElement
//     | TConsItemElement
//     | TSequenceArrowGroupElement
//     | TSequenceArrowItemElement
//     | TButtonElement
//     | TTableElement
//     | TTableRowElement
//     | TTableCellElement
