import type { User } from '@prisma/client'

import { AbilityBuilder, PureAbility } from '@casl/ability'

export type Actions = 'manage' | 'read' | 'update' | 'delete'
export type Subjects = 'all' | 'User' | 'BaseDocument' | 'CustomTheme' | 'GeneratedImage'

export default function defineAbilitiesFor(user: User | null) {
  const { can, build } = new AbilityBuilder<PureAbility<[Actions, Subjects]>>(PureAbility)

  if (!user) {
    can('read', 'BaseDocument')
    return build()
  }

  if (user.role === 'ADMIN') {
    can('manage', 'all')
    return build()
  }

  // ✨ User
  can('read', 'User', { id: user.id })
  can('update', 'User', { id: user.id })
  can('delete', 'User', { id: user.id })

  // ✨ BaseDocument
  can('read', 'BaseDocument')
  can('update', 'BaseDocument', { userId: user.id })
  can('delete', 'BaseDocument', { userId: user.id })

  // ✨ GeneratedImage
  can('read', 'GeneratedImage', { userId: user.id })
  can('delete', 'GeneratedImage', { userId: user.id })
  can('update', 'GeneratedImage', { userId: user.id })

  // ✨ CustomTheme
  can('read', 'CustomTheme', { userId: user.id })
  can('delete', 'CustomTheme', { userId: user.id })
  can('update', 'CustomTheme', { userId: user.id })

  return build()
}
