// import { join } from 'node:path'
// import { existsSync, readdirSync } from 'node:fs'
// // modules/i18n-auto-loader.ts

import { defineNuxtModule } from 'nuxt/kit'

// import { addTemplate, createResolver, defineNuxtModule, logger } from '@nuxt/kit'
export default defineNuxtModule({
  meta: {
    name     : 'i18n-auto-loader',
    configKey: 'i18nAutoLoader',
  },
})
// export default defineNuxtModule({
//   meta: {
//     name     : 'i18n-auto-loader',
//     configKey: 'i18nAutoLoader',
//   },
//   defaults: {
//     localesDir    : 'locales',
//     fileExtensions: ['.json'],
//     exclude       : ['index.js', 'index.ts'],
//   },
//   async setup(options, nuxt) {
//     const { resolve } = createResolver(import.meta.url)
//     const startTime = Date.now()

//     // 解析 locales 目录路径
//     const localesDir = resolve(nuxt.options.srcDir, options.localesDir)

//     logger.info(`Scanning locales directory: ${localesDir}`)

//     // 检查 locales 目录是否存在
//     if (!existsSync(localesDir)) {
//       logger.warn(`Locales directory not found: ${localesDir}`)
//       return
//     }

//     // 扫描所有语言目录
//     const localeDirs = readdirSync(localesDir, { withFileTypes: true })
//       .filter(dirent => dirent.isDirectory())
//       .map(dirent => dirent.name)

//     if (localeDirs.length === 0) {
//       logger.warn(`No locale directories found in: ${localesDir}`)
//       return
//     }

//     logger.info(`Found ${localeDirs.length} locales: ${localeDirs.join(', ')}`)

//     const generatedLocales = []
//     const virtualFiles = []

//     // 处理每个语言目录
//     for (const localeCode of localeDirs) {
//       const localePath = join(localesDir, localeCode)

//       // 扫描该语言目录下的所有翻译文件
//       const translationFiles = readdirSync(localePath)
//         .filter((file) => {
//           const ext = file.substring(file.lastIndexOf('.'))
//           return options.fileExtensions.includes(ext)
//             && !options.exclude.includes(file)
//         })
//         .map(file => ({
//           name: file.replace(/\.[^/.]+$/, ''), // 移除扩展名
//           path: join(localePath, file),
//         }))

//       if (translationFiles.length === 0) {
//         logger.warn(`No translation files found for locale: ${localeCode}`)
//         continue
//       }

//       logger.info(`Found ${translationFiles.length} files for ${localeCode}: ${translationFiles.map(f => f.name).join(', ')}`)

//       // 生成导入语句和合并导出
//       const importStatements = translationFiles.map(file =>
//         `import ${file.name} from '${file.path}'`,
//       ).join('\n')

//       const mergeStatements = translationFiles.map(file =>
//         `  ...${file.name}`,
//       ).join(',\n')

//       const virtualContent = `${importStatements}\n\nexport default {\n${mergeStatements}\n}`

//       // 创建虚拟文件
//       const virtualFileName = `i18n/${localeCode}.js`
//       addTemplate({
//         filename   : virtualFileName,
//         getContents: () => virtualContent,
//         write      : true,
//       })

//       virtualFiles.push(virtualFileName)

//       // 根据 code 自动生成完整的 locale 配置
//       const localeConfig = generateLocaleConfig(localeCode)

//       // 添加到 locales 配置
//       generatedLocales.push({
//         ...localeConfig,
//         file: virtualFileName,
//       })
//     }

//     // 等待模块系统准备完成后配置 i18n
//     nuxt.hook('modules:done', () => {
//       if (!nuxt.options.i18n) {
//         logger.warn('@nuxtjs/i18n module is not configured. Auto-loader will not work.')
//         return
//       }

//       // 确保 i18n 配置存在
//       const i18nConfig = nuxt.options.i18n as any

//       // 配置懒加载和语言目录
//       i18nConfig.lazy = true
//       i18nConfig.langDir = './.nuxt/i18n' // 虚拟文件输出目录

//       // 合并 locales 配置
//       if (Array.isArray(i18nConfig.locales)) {
//         // 合并现有配置和生成的配置，避免重复
//         const existingCodes = new Set(i18nConfig.locales.map((loc: any) => loc.code))
//         const newLocales = generatedLocales.filter(loc => !existingCodes.has(loc.code))
//         i18nConfig.locales = [...i18nConfig.locales, ...newLocales]
//       }
//       else {
//         i18nConfig.locales = generatedLocales
//       }

//       // 设置默认语言（如果未设置）
//       if (!i18nConfig.defaultLocale && generatedLocales.length > 0) {
//         i18nConfig.defaultLocale = generatedLocales[0].code
//       }

//       logger.success(`Auto-configured ${generatedLocales.length} locales with ${virtualFiles.length} virtual files in ${Date.now() - startTime}ms`)
//       logger.info(`Generated locales: ${generatedLocales.map(loc => `\n  - ${loc.code} (${loc.language}): ${loc.name}`).join('')}`)
//     })

//     // 监听文件变化，在开发模式下自动更新
//     if (nuxt.options.dev) {
//       nuxt.hook('builder:watch', async (event, path) => {
//         const fullPath = resolve(nuxt.options.srcDir, path)
//         if (fullPath.startsWith(localesDir)) {
//           logger.info(`Locales changed: ${path}. Will reload on next build.`)
//         }
//       })
//     }
//   },
// })

// // 根据 code 自动生成完整的 locale 配置
// function generateLocaleConfig(code: string): { code: string, language: string, name: string } {
//   // 常见的语言代码映射
//   const languageMappings: Record<string, { language: string, name: string }> = {
//     'en'   : { language: 'en-US', name: 'English' },
//     'en-us': { language: 'en-US', name: 'English' },
//     'en-gb': { language: 'en-GB', name: 'English (UK)' },
//     'zh'   : { language: 'zh-CN', name: '中文' },
//     'zh-cn': { language: 'zh-CN', name: '中文' },
//     'zh-tw': { language: 'zh-TW', name: '中文（繁體）' },
//     'zh-hk': { language: 'zh-HK', name: '中文（香港）' },
//     'jp'   : { language: 'ja-JP', name: '日本語' },
//     'ja'   : { language: 'ja-JP', name: '日本語' },
//     'ja-jp': { language: 'ja-JP', name: '日本語' },
//     'ko'   : { language: 'ko-KR', name: '한국어' },
//     'ko-kr': { language: 'ko-KR', name: '한국어' },
//     'fr'   : { language: 'fr-FR', name: 'Français' },
//     'fr-fr': { language: 'fr-FR', name: 'Français' },
//     'de'   : { language: 'de-DE', name: 'Deutsch' },
//     'de-de': { language: 'de-DE', name: 'Deutsch' },
//     'es'   : { language: 'es-ES', name: 'Español' },
//     'es-es': { language: 'es-ES', name: 'Español' },
//     'it'   : { language: 'it-IT', name: 'Italiano' },
//     'it-it': { language: 'it-IT', name: 'Italiano' },
//     'pt'   : { language: 'pt-PT', name: 'Português' },
//     'pt-br': { language: 'pt-BR', name: 'Português (Brasil)' },
//     'ru'   : { language: 'ru-RU', name: 'Русский' },
//     'ru-ru': { language: 'ru-RU', name: 'Русский' },
//     'ar'   : { language: 'ar-SA', name: 'العربية' },
//     'ar-sa': { language: 'ar-SA', name: 'العربية' },
//   }

//   const normalizedCode = code.toLowerCase()

//   // 如果找到映射，使用映射的值
//   if (languageMappings[normalizedCode]) {
//     return {
//       code,
//       ...languageMappings[normalizedCode],
//     }
//   }

//   // 对于没有映射的代码，尝试智能生成
//   const parts = code.split('-')
//   const baseLanguage = parts[0]

//   // 如果基础语言有映射，使用它作为基础
//   if (languageMappings[baseLanguage]) {
//     const baseConfig = languageMappings[baseLanguage]
//     return {
//       code,
//       language: code, // 使用原始代码作为 language
//       name    : generateDisplayName(code, baseConfig.name),
//     }
//   }

//   // 完全未知的语言代码，使用通用格式
//   return {
//     code,
//     language: code,
//     name    : generateDisplayName(code),
//   }
// }

// // 生成显示名称
// function generateDisplayName(code: string, baseName?: string): string {
//   if (baseName) {
//     // 如果有基础名称，添加地区信息
//     const region = code.split('-')[1]
//     if (region) {
//       return `${baseName} (${region.toUpperCase()})`
//     }
//     return baseName
//   }

//   // 生成通用显示名称
//   const parts = code.split('-').map((part) => {
//     // 简单的首字母大写
//     return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
//   })

//   return parts.join(' ')
// }
