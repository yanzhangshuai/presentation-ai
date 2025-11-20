// const localeFiles = import.meta.glob('../locales/**/*.json', { eager: true })

// function mergeMessages(files: Record<string, any>) {
//   const messages: Record<string, any> = {}
//   console.log('Merged i18n messages:', messages)

//   for (const path in files) {
//     // path 示例: ../locales/zh/common.json
//     const match = path.match(/locales\/([^/]+)\//)
//     if (!match)
//       continue
//     const lang = match[1] // zh / en / zh-hk / jp

//     if (!messages[lang])
//       messages[lang] = {}
//     Object.assign(messages[lang], files[path].default)
//   }

//   return messages
// }

// export default {
//   legacy  : false,
//   locale  : 'en', // 默认语言
//   messages: mergeMessages(localeFiles),
// }
