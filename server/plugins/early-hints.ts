export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const res = event.node.res

    // 如果方法不存在，直接返回
    if (!res.writeEarlyHints)
      return

    const cssLinks = html.head
      .filter(tag => tag.includes('.css')) // 只要包含 .css 就抓取
      .map((tag) => {
        const match = tag.match(/href="([^"]+)"/)
        return match ? match[1] : null
      })
      .filter(Boolean)

    if (cssLinks.length > 0) {
      const linkHeader = cssLinks
        .map(href => `<${href}>; rel="preload"; as="style"`)
        .join(', ')

      res.writeEarlyHints({
        link: linkHeader,
      })
    }
  })
})
