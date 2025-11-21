// scripts/i18n-sync-and-convert.ts
import process from 'node:process'
import { convertJsonToTs } from './convert-i18n-json-to-ts.js'
import { syncLocales } from './i18n-baidu-translate.js'

async function main() {
  try {
    console.log('🌐 开始同步 i18n 语言文件...')
    await syncLocales()   // 先翻译
    console.log('✅ i18n 翻译完成')

    console.log('🔧 开始生成 TS 文件...')
    convertJsonToTs()     // 再生成 ts
    console.log('✅ TS 文件生成完成')
  }
  catch (e) {
    console.error('❌ i18n 处理失败:', e)
    process.exit(1)
  }
}

main()
