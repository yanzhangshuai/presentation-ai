import type { LanguageSupport, PresentationTone } from '../types/presentation'

export const presentationTones: Record<PresentationTone, string> = {
  professional: 'Professional',
  creative    : 'Creative',
  minimalist  : 'Minimalist',
  bold        : 'Bold',
  elegant     : 'Elegant',
}

export const languageSupports: Record<LanguageSupport, string> = {
  'en'   : 'English (US)',
  'pt'   : 'Portuguese',
  'es'   : 'Spanish',
  'fr'   : 'French',
  'de'   : 'German',
  'it'   : 'Italian',
  'ja'   : 'Japanese',
  'ko'   : 'Korean',
  'zh'   : '简体中文',
  'zh-TW': '繁體中文',
  'ru'   : 'Russian',
  'hi'   : 'Hindi',
  'ar'   : 'Arabic',
}
