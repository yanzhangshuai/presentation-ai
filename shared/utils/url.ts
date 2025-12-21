export function joinURL(base: string, ...paths: string[]) {
  const url = new URL(base)

  const basePath = url.pathname.replace(/\/+$/, '')
  const extraPath = paths
    .map(p => p.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')

  url.pathname = [basePath, extraPath].filter(Boolean).join('/')

  return url.toString()
}
