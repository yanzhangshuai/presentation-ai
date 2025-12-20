export interface PresentationThemeListReq extends PaginationReq {
  type?: PresentationThemeType

}

export interface PresentationTheme {
  id          : string
  name        : string
  description?: string
  themeData   : PresentationThemeProperties
  logoUrl?    : string
  isPublic    : boolean
  type        : PresentationThemeType
  userId      : string | null
  createdAt   : Date
  updatedAt   : Date
}

export enum PresentationThemeType {
  /**
   * 系统预设
   */
  System = 'SYSTEM',

  /**
   * 用户自定义
   */
  Custom = 'CUSTOM',

}

export interface PresentationThemeProperties {
  // name       : string
  // description: string
  colors: {
    light: ThemeColors
    dark : ThemeColors
  }
  fonts       : ThemeFonts
  borderRadius: string
  transitions : ThemeTransitions
  shadows: {
    light: ThemeShadows
    dark : ThemeShadows
  }
}

/**
 *  主题颜色
 */
export interface ThemeColors {
  primary   : string
  secondary : string
  accent    : string
  background: string
  text      : string
  heading   : string
  muted     : string
}

/**
 * 主题字体
 */
export interface ThemeFonts {
  heading: string
  body   : string
}

/**
 * 主题动画
 */
export interface ThemeTransitions {
  default: string
}

/**
 * 主题阴影
 */
export interface ThemeShadows {
  card  : string
  button: string
}
