export interface PlateSlide {
  id         : string
  content    : any[]
  rootImage? : any
  layoutType?: 'left' | 'right' | 'vertical' | 'background' | undefined
  alignment? : 'start' | 'center' | 'end'
  bgColor?   : string
  width?     : 'S' | 'M' | 'L'
}
