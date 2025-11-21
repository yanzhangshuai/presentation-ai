import type { Composer } from 'vue-i18n'

import { defineNuxtPlugin } from 'nuxt/app'

interface FontInfo {
  url   : string
  family: string
}

export default defineNuxtPlugin((nuxtApp) => {
  const fontMap: Record<string, FontInfo> = {
    'zh-cn': { url: '/fonts/SourceHanSansCN-VF.otf.woff2', family: 'SourceHanSansCN' },
    'zh-hk': { url: '/fonts/SourceHanSansHK-VF.otf.woff2', family: 'SourceHanSansHK' },
    'jp'   : { url: '/fonts/SourceHanSansJP-VF.otf.woff2', family: 'SourceHanSansJP' },
    'en'   : { url: '/fonts/InterVariable.ttf', family: 'Inter' },
    // 'zh-tw': { url: '/fonts/SourceHanSansTW-VF.otf.woff2', family: 'SourceHanSansTW' },
  }

  // 🔥 加载字体
  const loadedFonts = new Set<string>()

  const loadFont = async (lang: string) => {
    const fontInfo = fontMap[lang]
    if (!fontInfo || loadedFonts.has(lang))
      return

    try {
      const font = new FontFace(fontInfo.family, `url(${fontInfo.url})`, {
        weight: '100 900',
        style : 'normal',
      })
      await font.load()
      document.fonts.add(font)
      loadedFonts.add(lang)
    }
    catch (e) {
      console.error(`[Font Loader] Failed to load font for ${lang}`, e)
    }
  }

  const locale = toValue((nuxtApp.$i18n as Composer)?.locale) || 'en'

  // 首屏加载当前语言
  loadFont(locale)

  // 异步预加载其他语言
  const otherLangs = Object.keys(fontMap).filter(l => l !== locale)
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => otherLangs.forEach(loadFont))
  }
  else {
    setTimeout(() => otherLangs.forEach(loadFont), 3000)
  }

  // 提供 loadFont 给组件使用
  nuxtApp.provide('loadFont', loadFont)
})
