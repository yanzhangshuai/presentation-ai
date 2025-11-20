import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import axios from 'axios'

// ===== 配置 =====
const APP_ID = '20251120002502144'
const APP_KEY = 'G1xtq4rnw4uqvnZxMrij'

const SOURCE_LANG = 'en'
const LOCALES_DIR = './i18n/locales'
const CACHE_FILE = './i18n/translate.cache.json'
const BATCH_SIZE = 5       // 批量翻译，每次最多5条
const THROTTLE_MS = 200    // 节流：每次批量翻译后等待毫秒数

// 语言映射表
const LANG_MAP = {
  'en'   : 'en',
  'zh'   : 'zh',
  'zh-hk': 'cht', // 香港/繁体
  'jp'   : 'jp',
  'ko'   : 'kor',
  'fr'   : 'fra',
  'de'   : 'de',
  'es'   : 'spa',
  'ru'   : 'ru',
  'pt'   : 'pt',
  'it'   : 'it',
  'ar'   : 'ara',
}

// ===== 缓存操作 =====
let cache = {}
if (fs.existsSync(CACHE_FILE))
  cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8')
}

// ===== 读取 Nuxt i18n 配置 locales =====
function getTargetLangs() {
  const nuxtConfig = fs.readFileSync('./nuxt.config.ts', 'utf8')
  const match = nuxtConfig.match(/locales\s*:\s*\[([\s\S]*?)\]/)
  if (!match)
    return ['en', 'jp']

  const localesStr = match[1]
  const codes = [...localesStr.matchAll(/code\s*:\s*['"]([\w-]+)['"]/g)].map(m => m[1])
  return codes.filter(c => c !== SOURCE_LANG)
}
const TARGET_LANGS = getTargetLangs()

console.log('目标语言:', TARGET_LANGS.join(', '))

// ===== 百度翻译 API =====
async function baiduTranslate(q, to) {
  if (cache[q]?.[to])
    return cache[q][to]

  const salt = Date.now()
  const sign = crypto.createHash('md5').update(APP_ID + q + salt + APP_KEY).digest('hex')

  try {
    const res = await axios.get('https://fanyi-api.baidu.com/api/trans/vip/translate', {
      params: { q, from: SOURCE_LANG, to: LANG_MAP[to] || 'en', salt, sign, appid: APP_ID },
    })

    if (res.data.error_code) {
      throw new Error(`API错误 ${res.data.error_code}: ${res.data.error_msg}`)
    }
    const translated = res.data.trans_result?.[0]?.dst || q

    if (!cache[q])
      cache[q] = {}
    cache[q][to] = translated
    saveCache()
    return translated
  }
  catch (e) {
    console.error('翻译失败:', q, e.message)
    return q
  }
}

// ===== 批量翻译 =====
async function translateBatch(strings, to) {
  const results = []
  for (let i = 0; i < strings.length; i += BATCH_SIZE) {
    const batch = strings.slice(i, i + BATCH_SIZE)
    const translatedBatch = await Promise.all(batch.map(s => baiduTranslate(s, to)))
    results.push(...translatedBatch)
    await new Promise(r => setTimeout(r, THROTTLE_MS))
  }
  return results
}

// ===== 递归获取所有字符串 key =====
function flattenStrings(obj, prefix = '') {
  let entries = []
  for (const key in obj) {
    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string')
      entries.push({ key: newKey, value })
    else if (value && typeof value === 'object')
      entries.push(...flattenStrings(value, newKey))
  }
  return entries
}

// ===== 根据 key 重建对象 =====
function rebuildObject(entries) {
  const obj = {}
  for (const { key, value } of entries) {
    const keys = key.split('.')
    let cur = obj
    keys.forEach((k, idx) => {
      if (idx === keys.length - 1) {
        cur[k] = value
      }
      else {
        if (!cur[k])
          cur[k] = {}
        cur = cur[k]
      }
    })
  }
  return obj
}

// ===== 主函数 =====
async function syncLocales() {
  const sourceDir = path.join(LOCALES_DIR, SOURCE_LANG)
  if (!fs.existsSync(sourceDir)) {
    console.error(`源语言目录不存在: ${sourceDir}`)
    process.exit(1)
  }

  const files = fs.readdirSync(sourceDir)
  console.log(`找到 ${files.length} 个源语言文件，开始翻译...`)
  for (const file of files) {
    const srcFile = path.join(sourceDir, file)
    const srcJson = JSON.parse(fs.readFileSync(srcFile, 'utf8'))
    const flatSrc = flattenStrings(srcJson)

    for (const lang of TARGET_LANGS) {
      const targetDir = path.join(LOCALES_DIR, lang)
      if (!fs.existsSync(targetDir))
        fs.mkdirSync(targetDir, { recursive: true })

      const targetFile = path.join(targetDir, file)
      let targetJson = {}
      if (fs.existsSync(targetFile))
        targetJson = JSON.parse(fs.readFileSync(targetFile, 'utf8'))
      const flatTarget = flattenStrings(targetJson)

      // 筛选新增或修改的 key
      const toTranslateEntries = flatSrc.filter((f) => {
        const existing = flatTarget.find(t => t.key === f.key)
        return !existing || existing.value !== f.value
      })

      if (toTranslateEntries.length === 0)
        continue

      console.log(`翻译 ${lang}/${file} 共 ${toTranslateEntries.length} 条`)
      const texts = toTranslateEntries.map(f => f.value)
      const translatedTexts = await translateBatch(texts, lang)

      // 合并翻译结果
      const mergedEntries = flatTarget.map(f => ({ ...f })) // 保留原有
      toTranslateEntries.forEach((f, idx) => {
        mergedEntries.push({ key: f.key, value: translatedTexts[idx] })
      })

      const rebuilt = rebuildObject(mergedEntries)
      fs.writeFileSync(targetFile, JSON.stringify(rebuilt, null, 2), 'utf8')
      console.log(`✔ 写入 ${targetFile}`)
    }
  }

  console.log('\n🎉 中文 → 其他语言 JSON 增量翻译完成！')
}

syncLocales()
