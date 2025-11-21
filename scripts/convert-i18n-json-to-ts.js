// scripts/convert-i18n-json-to-ts.ts
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// i18n 路径
const localesDir = path.resolve(process.cwd(), 'i18n/locales')
const outputDir = localesDir // 输出到同级目录

export function convertJsonToTs() {
  // 获取所有语言文件夹
  const languages = fs.readdirSync(localesDir).filter(f =>
    fs.statSync(path.join(localesDir, f)).isDirectory(),
  )

  languages.forEach((lang) => {
    const langDir = path.join(localesDir, lang)
    const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'))

    // 生成 import 语句和 export 对象
    const imports = []
    const exports = []

    files.forEach((file) => {
      const name = path.basename(file, '.json') // 文件名作为 key
      imports.push(`import ${name} from './${lang}/${file}'`)
      exports.push(`${name}: ${name}`)
    })

    const content = `${imports.join('\n')}

export default {
  ${exports.join(',\n  ')}
}
`

    const outFile = path.join(outputDir, `${lang}.ts`)
    fs.writeFileSync(outFile, content, 'utf-8')
    console.log(`✅ Generated ${outFile}`)
  })
}
