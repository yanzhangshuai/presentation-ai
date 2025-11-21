// // db/seed.ts
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// async function main() {
//   // 创建管理员用户
//   const admin = await prisma.user.upsert({
//     where : { email: 'admin@example.com' },
//     update: {},
//     create: {
//       name     : 'Admin',
//       email    : 'admin@example.com',
//       password : 'hashed_password', // 实际使用时要 hash
//       role     : 'ADMIN',
//       hasAccess: true,
//     },
//   })

//   // 创建默认主题
//   await prisma.customTheme.create({
//     data: {
//       name     : 'Default Theme',
//       userId   : admin.id,
//       themeData: {
//         color: 'blue',
//         font : 'Arial',
//       },
//       isPublic: true,
//     },
//   })

//   console.log('✅ Database seeded!')
// }

// main()
//   .catch(e => console.error(e))
//   .finally(async () => {
//     await prisma.$disconnect()
//   })
