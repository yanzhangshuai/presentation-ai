import { execSync } from 'node:child_process'
import process from 'node:process'

try {
  console.log('Generating Prisma Client...')
  execSync('prisma generate --config ./db/prisma.config.ts', { stdio: 'inherit' })

  console.log('Preparing Nuxt...')
  execSync('nuxt prepare', { stdio: 'inherit' })

  console.log('Postinstall done!')
}
catch (err) {
  console.error('Postinstall failed:', err)
  process.exit(1)
}
