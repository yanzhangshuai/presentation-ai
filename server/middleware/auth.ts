import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  // /api/auth/xx // /api/public 不需要认证

  // 需要授权的组
  const authGroups = [
    '/api/document',
    '/api/presentation',
    '/api/user',
  ]

  if (!authGroups.some(path => event.path.startsWith(path))) {
    return
  }

  console.log('Authenticating request to:', event.path)

  const session = await getServerSession(event)
  if (!session || !session.user || !session.user.id) {
    throw createError({
      statusMessage: 'Unauthenticated',
      statusCode   : 401,
    })
  }
})
