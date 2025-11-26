export type ThemeName
  = | 'daktilo'
    | 'cornflower'
    | 'orbit'
    | 'piano'
    | 'mystique'
    | 'gammaDark'
    | 'crimson'
    | 'sunset'
    | 'forest'

interface ThemeColors {
  primary   : string
  secondary : string
  accent    : string
  background: string
  text      : string
  heading   : string
  muted     : string
}

interface ThemeFonts {
  heading: string
  body   : string
}

interface ThemeTransitions {
  default: string
}

interface ThemeShadows {
  card  : string
  button: string
}

export interface ThemeProperties {
  name       : string
  description: string
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

// export type Themes = keyof typeof themes
