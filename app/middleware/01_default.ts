export default defineNuxtRouteMiddleware((to, from) => {
  // 暂时简化中间件，避免渲染器初始化问题
  try {
    // 原有的逻辑（如果需要保留）
    if (to.params.id === '1') {
      return abortNavigation()
    }
    
    // TODO: 重新启用认证中间件 once auth is properly configured
    // const { data: sessionData, status } = useAuth()
    // const loggedIn = computed(() => status.value === 'authenticated')
    // const user = computed(() => sessionData.value?.user as any)
    
    // // 需要认证的路由列表
    // const protectedRoutes = ['/dashboard', '/profile', '/admin', '/settings']
    // const adminRoutes = ['/admin']
    
    // // 检查是否是受保护的路由
    // const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))
    // const isAdminRoute = adminRoutes.some(route => to.path.startsWith(route))
    
    // // 如果访问受保护的路由但未登录
    // if (isProtectedRoute && !loggedIn.value) {
    //   return navigateTo('/login')
    // }
    
    // // 如果访问管理员路由但用户不是管理员
    // if (isAdminRoute && loggedIn.value && user.value?.role !== 'ADMIN') {
    //   return navigateTo('/unauthorized')
    // }
    
    // // 检查特定权限的路由
    // if (to.path.startsWith('/premium') && loggedIn.value && !user.value?.hasAccess) {
    //   return navigateTo('/upgrade')
    // }
  } catch (error) {
    console.error('Middleware error:', error)
    // 在出错时允许导航继续，避免阻塞整个应用
  }
})
