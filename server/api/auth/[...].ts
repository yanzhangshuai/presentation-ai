import type { User, UserRole } from '~~/prisma/generated/client'

import { NuxtAuthHandler } from '#auth'
import { db } from '~~/server/db/index'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from '@auth/core/providers/google'
import GithubProvider from '@auth/core/providers/github'

// 扩展 NextAuth 的类型
declare module 'next-auth' {
  interface Session {
    user: User & {
      isAdmin: boolean
    }
  }

}

declare module 'next-auth/jwt' {
  interface JWT {
    id       : string
    hasAccess: boolean
    location?: string | null
    role     : string
    isAdmin  : boolean
  }
}

export default NuxtAuthHandler({
  secret : useRuntimeConfig().authSecret,
  adapter: PrismaAdapter(db) as any,
  pages  : {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge  : 30 * 24 * 60 * 60, // 30天
  },
  providers: [
    GithubProvider({
      clientId    : useRuntimeConfig().githubClientId,
      clientSecret: useRuntimeConfig().githubClientSecret,
    }) as any,
    GoogleProvider({
      id           : 'google',
      name         : 'Google',
      // @ts-expect-error 类型错误
      type         : 'oauth',
      wellKnown    : 'https://accounts.google.com/.well-known/openid-configuration',
      authorization: { params: { scope: 'openid email profile' } },
      idToken      : true,
      checks       : ['pkce', 'state'],
      profile(profile) {
        return {
          id   : profile.sub,
          name : profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
      style: {
        logo: '/google.svg',
        bg  : '#fff',
        text: '#000',
      },
      clientId    : useRuntimeConfig().googleClientId,
      clientSecret: useRuntimeConfig().googleClientSecret,

    }) as any,
  ],

  callbacks: {
    // 登录时调用的 signIn 回调：在这里我们尝试把 provider 返回的 email 与已有用户合并
    async signIn({ account, profile }) {
      try {
        const email = profile?.email
        const emailVerified = (profile as any)?.email_verified ?? true

        if (email && emailVerified && account) {
          // 查找已有用户
          const existing = await db.user.findUnique({ where: { email } })

          if (existing) {
            // 把当前 OAuth 账号绑定到 existing.id
            await db.account.upsert({
              where: {
                provider_providerAccountId: {
                  provider         : account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
              update: { userId: existing.id },
              create: {
                userId           : existing.id,
                provider         : account.provider,
                providerAccountId: account.providerAccountId,
                type             : account.type,
                access_token     : account.access_token,
                refresh_token    : account.refresh_token,
                id_token         : account.id_token,
                expires_at       : account.expires_at ? Number(account.expires_at) : null,
              },
            })

            // Prevent creating a duplicate User by letting adapter handle linking
            return true
          }
        }

        return true
      }
      catch (err) {
        console.error('signIn callback error', err)
        return false
      }
    },

    async jwt({ token, user }) {
      if (user) {
        // 从数据库获取完整的用户信息
        const dbUser = await db.user.findUnique({
          where : { id: user.id },
          select: { id: true, hasAccess: true, location: true, role: true },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.hasAccess = dbUser.hasAccess
          token.location = dbUser.location
          token.role = dbUser.role
          token.isAdmin = dbUser.role === 'ADMIN'
        }

        // 保留基本信息
        token.name = user.name
        token.image = user.image
        token.picture = user.image
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.email = token.email as string | null
        session.user.name = token.name as string | null
        session.user.image = token.picture as string | null
        session.user.hasAccess = token.hasAccess
        session.user.location = token.location as string | null
        session.user.role = token.role as UserRole
        session.user.isAdmin = token.isAdmin
      }
      return session
    },

  },
})
