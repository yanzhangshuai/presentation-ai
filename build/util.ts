import fs from 'node:fs'
import path from 'node:path'

export function getI18nFiles(locale: string) {
  const localeDir = path.resolve('./i18n/locales', locale)
  if (!fs.existsSync(localeDir))
    return []

  const files: string[] = []

  const traverseDir = (dir: string, relativePath = '') => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relPath = path.join(relativePath, entry.name)
      if (entry.isDirectory()) {
        traverseDir(fullPath, relPath)
      }
      else if (entry.isFile() && entry.name.endsWith('.json')) {
        files.push(`${locale}/${relPath}`)
      }
    }
  }

  traverseDir(localeDir)
  return files
}
