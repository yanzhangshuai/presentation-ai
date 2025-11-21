import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { translate } from '@vitalets/google-translate-api'

// ===== 配置区 =====
const SOURCE_LANG = 'zh'
const TARGET_LANGS = ['en', 'ja', 'es', 'fr', 'de', 'ru', 'pt', 'it', 'ko', 'ar']
const LOCALES_DIR = './locales'

// ===== 工具函数 =====
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'))
function writeJson(file, data) {
  return fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
}

// 递归翻译对象
async function translateObject(obj, targetLang) {
  const result = {}
  for (const key in obj) {
    const value = obj[key]
    if (typeof value === 'string') {
      try {
        const res = await translate(value, { from: 'zh', to: targetLang })
        result[key] = res.text
      }
      catch (e) {
        console.error(`翻译失败: ${value}`, e.message)
        result[key] = value
      }
    }
    else if (typeof value === 'object' && value !== null) {
      result[key] = await translateObject(value, targetLang)
    }
    else {
      result[key] = value
    }
  }
  return result
}

// ===== 主函数 =====
async function syncLocales() {
  const sourceDir = path.join(LOCALES_DIR, SOURCE_LANG)
  if (!fs.existsSync(sourceDir)) {
    console.error(`源语言目录不存在: ${sourceDir}`)
    process.exit(1)
  }

  const files = fs.readdirSync(sourceDir)

  for (const file of files) {
    const srcFile = path.join(sourceDir, file)
    const srcJson = readJson(srcFile)

    for (const lang of TARGET_LANGS) {
      const targetDir = path.join(LOCALES_DIR, lang)
      const targetFile = path.join(targetDir, file)

      // 创建目录
      if (!fs.existsSync(targetDir))
        fs.mkdirSync(targetDir, { recursive: true })

      let targetJson = {}
      if (fs.existsSync(targetFile))
        targetJson = readJson(targetFile)

      // 补充缺失字段并翻译
      const updatedJson = { ...targetJson }
      for (const key in srcJson) {
        if (!(key in targetJson)) {
          console.log(`翻译: ${lang}/${file}: ${key}`)
          updatedJson[key] = (await translateObject({ [key]: srcJson[key] }, lang))[key]
        }
      }

      writeJson(targetFile, updatedJson)
      console.log(`✔ 写入 ${targetFile}`)
    }
  }

  console.log('\n🎉 中文 → 其他语言 JSON 自动翻译完成！')
}

syncLocales()
