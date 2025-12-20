import 'dotenv/config'
import process from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'

import { PresentationThemeType, PrismaClient } from '../shared/prisma/client'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: `${process.env.DATABASE_URL}` }),
})

async function seedThemes() {
  const presetThemes = [
    // Daktilo
    {
      name       : 'Daktilo',
      description: 'Modern and clean',
      type       : PresentationThemeType.SYSTEM,
      isPublic   : true,
      userId     : null,
      themeData  : {
        colors: {
          light: {
            primary   : '#3B82F6',
            secondary : '#1F2937',
            accent    : '#60A5FA',
            background: '#FFFFFF',
            text      : '#1F2937',
            heading   : '#111827',
            muted     : '#6B7280',
          },
          dark: {
            primary   : '#60A5FA',
            secondary : '#E5E7EB',
            accent    : '#93C5FD',
            background: '#111827',
            text      : '#E5E7EB',
            heading   : '#F9FAFB',
            muted     : '#9CA3AF',
          },
        },
        fonts: {
          heading: 'Inter',
          body   : 'Inter',
        },
        borderRadius: '0.5rem',
        transitions : {
          default: 'all 0.2s ease-in-out',
        },
        shadows: {
          light: {
            card  : '0 1px 3px rgba(0,0,0,0.12)',
            button: '0 2px 4px rgba(59,130,246,0.1)',
          },
          dark: {
            card  : '0 1px 3px rgba(0,0,0,0.3)',
            button: '0 2px 4px rgba(96,165,250,0.2)',
          },
        },
      },
    },
    // Cornflower
    {
      name       : 'Cornflower',
      description: 'Professional and bold',
      type       : PresentationThemeType.SYSTEM,
      isPublic   : true,
      userId     : null,
      themeData  : {
        colors: {
          light: {
            primary   : '#4F46E5',
            secondary : '#312E81',
            accent    : '#818CF8',
            background: '#F8FAFC',
            text      : '#334155',
            heading   : '#1E293B',
            muted     : '#64748B',
          },
          dark: {
            primary   : '#818CF8',
            secondary : '#C7D2FE',
            accent    : '#A5B4FC',
            background: '#1E1B4B',
            text      : '#E2E8F0',
            heading   : '#F8FAFC',
            muted     : '#94A3B8',
          },
        },
        fonts: {
          heading: 'Poppins',
          body   : 'Source Sans Pro',
        },
        borderRadius: '0.75rem',
        transitions : {
          default: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        shadows: {
          light: {
            card  : '0 4px 6px rgba(0,0,0,0.05)',
            button: '0 4px 6px rgba(79,70,229,0.1)',
          },
          dark: {
            card  : '0 4px 6px rgba(0,0,0,0.2)',
            button: '0 4px 6px rgba(129,140,248,0.2)',
          },
        },
      },
    },
    // Orbit
    {
      name       : 'Orbit',
      description: 'Futuristic and dynamic',
      type       : PresentationThemeType.SYSTEM,
      isPublic   : true,
      userId     : null,
      themeData  : {
        colors: {
          light: {
            primary   : '#312E81',
            secondary : '#4338CA',
            accent    : '#3B82F6',
            background: '#FFFFFF',
            text      : '#1F2937',
            heading   : '#111827',
            muted     : '#6B7280',
          },
          dark: {
            primary   : '#818CF8',
            secondary : '#A5B4FC',
            accent    : '#60A5FA',
            background: '#030712',
            text      : '#E5E7EB',
            heading   : '#F9FAFB',
            muted     : '#9CA3AF',
          },
        },
        fonts: {
          heading: 'Space Grotesk',
          body   : 'IBM Plex Sans',
        },
        borderRadius: '1rem',
        transitions : {
          default: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        },
        shadows: {
          light: {
            card  : '0 8px 16px rgba(0,0,0,0.1)',
            button: '0 4px 12px rgba(49,46,129,0.1)',
          },
          dark: {
            card  : '0 8px 16px rgba(0,0,0,0.4)',
            button: '0 4px 12px rgba(129,140,248,0.2)',
          },
        },
      },
    },
    // Piano
    {
      name       : 'Piano',
      description: 'Classic and elegant',
      type       : PresentationThemeType.SYSTEM,
      isPublic   : true,
      userId     : null,
      themeData  : {
        colors: {
          light: {
            primary   : '#1F2937',
            secondary : '#374151',
            accent    : '#4B5563',
            background: '#F3F4F6',
            text      : '#374151',
            heading   : '#111827',
            muted     : '#6B7280',
          },
          dark: {
            primary   : '#E5E7EB',
            secondary : '#D1D5DB',
            accent    : '#9CA3AF',
            background: '#111827',
            text      : '#E5E7EB',
            heading   : '#F9FAFB',
            muted     : '#9CA3AF',
          },
        },
        fonts: {
          heading: 'Playfair Display',
          body   : 'Lora',
        },
        borderRadius: '0.25rem',
        transitions : {
          default: 'all 0.2s ease',
        },
        shadows: {
          light: {
            card  : '0 2px 4px rgba(0,0,0,0.08)',
            button: '0 1px 2px rgba(0,0,0,0.05)',
          },
          dark: {
            card  : '0 2px 4px rgba(0,0,0,0.2)',
            button: '0 1px 2px rgba(255,255,255,0.1)',
          },
        },
      },
    },
    // Mystique
    {
      name       : 'Mystique',
      description: 'Dark and sophisticated',
      type       : PresentationThemeType.SYSTEM,
      isPublic   : true,
      userId     : null,
      themeData  : {
        colors: {
          light: {
            primary   : '#7C3AED',
            secondary : '#5B21B6',
            accent    : '#8B5CF6',
            background: '#FFFFFF',
            text      : '#1F2937',
            heading   : '#111827',
            muted     : '#6B7280',
          },
          dark: {
            primary   : '#A78BFA',
            secondary : '#8B5CF6',
            accent    : '#C4B5FD',
            background: '#18181B',
            text      : '#D4D4D8',
            heading   : '#FAFAFA',
            muted     : '#A1A1AA',
          },
        },
        fonts: {
          heading: 'Montserrat',
          body   : 'Raleway',
        },
        borderRadius: '0.5rem',
        transitions : {
          default: 'all 0.3s ease-out',
        },
        shadows: {
          light: {
            card  : '0 4px 8px rgba(124,58,237,0.1)',
            button: '0 4px 12px rgba(124,58,237,0.15)',
          },
          dark: {
            card  : '0 4px 8px rgba(167,139,250,0.2)',
            button: '0 4px 12px rgba(167,139,250,0.25)',
          },
        },
      },
    },
    // Gamma Dark
    {
      name       : 'Gamma Dark',
      description: 'High contrast',
      type       : PresentationThemeType.SYSTEM,
      isPublic   : true,
      userId     : null,
      themeData  : {
        colors: {
          light: {
            primary   : '#06B6D4',
            secondary : '#0E7490',
            accent    : '#0EA5E9',
            background: '#FFFFFF',
            text      : '#0F172A',
            heading   : '#020617',
            muted     : '#475569',
          },
          dark: {
            primary   : '#22D3EE',
            secondary : '#67E8F9',
            accent    : '#38BDF8',
            background: '#0F172A',
            text      : '#E2E8F0',
            heading   : '#F8FAFC',
            muted     : '#94A3B8',
          },
        },
        fonts: {
          heading: 'JetBrains Mono',
          body   : 'Inter',
        },
        borderRadius: '0.375rem',
        transitions : {
          default: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        shadows: {
          light: {
            card  : '0 4px 12px rgba(6,182,212,0.1)',
            button: '0 4px 16px rgba(6,182,212,0.15)',
          },
          dark: {
            card  : '0 4px 12px rgba(34,211,238,0.15)',
            button: '0 4px 16px rgba(34,211,238,0.2)',
          },
        },
      },
    },
    // Crimson
    {
      name       : 'Crimson',
      description: 'Bold and passionate',
      type       : PresentationThemeType.SYSTEM,
      isPublic   : true,
      userId     : null,
      themeData  : {
        colors: {
          light: {
            primary   : '#DC2626',
            secondary : '#991B1B',
            accent    : '#F87171',
            background: '#FFFFFF',
            text      : '#1F2937',
            heading   : '#111827',
            muted     : '#6B7280',
          },
          dark: {
            primary   : '#F87171',
            secondary : '#FCA5A5',
            accent    : '#EF4444',
            background: '#18181B',
            text      : '#E5E7EB',
            heading   : '#F9FAFB',
            muted     : '#9CA3AF',
          },
        },
        fonts: {
          heading: 'Merriweather',
          body   : 'Source Sans Pro',
        },
        borderRadius: '0.5rem',
        transitions : {
          default: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        shadows: {
          light: {
            card  : '0 4px 8px rgba(220,38,38,0.1)',
            button: '0 4px 12px rgba(220,38,38,0.15)',
          },
          dark: {
            card  : '0 4px 8px rgba(248,113,113,0.2)',
            button: '0 4px 12px rgba(248,113,113,0.25)',
          },
        },
      },
    },
    // Sunset
    {
      name       : 'Sunset',
      description: 'Warm and inviting',
      type       : PresentationThemeType.SYSTEM,
      isPublic   : true,
      userId     : null,
      themeData  : {
        colors: {
          light: {
            primary   : '#EA580C',
            secondary : '#C2410C',
            accent    : '#FB923C',
            background: '#FFFBEB',
            text      : '#292524',
            heading   : '#1C1917',
            muted     : '#78716C',
          },
          dark: {
            primary   : '#FB923C',
            secondary : '#FDBA74',
            accent    : '#F97316',
            background: '#1C1917',
            text      : '#E7E5E4',
            heading   : '#FAFAF9',
            muted     : '#A8A29E',
          },
        },
        fonts: {
          heading: 'DM Serif Display',
          body   : 'DM Sans',
        },
        borderRadius: '0.625rem',
        transitions : {
          default: 'all 0.25s ease-in-out',
        },
        shadows: {
          light: {
            card  : '0 4px 8px rgba(234,88,12,0.1)',
            button: '0 4px 12px rgba(234,88,12,0.15)',
          },
          dark: {
            card  : '0 4px 8px rgba(251,146,60,0.2)',
            button: '0 4px 12px rgba(251,146,60,0.25)',
          },
        },
      },
    },
    //  Forest
    {
      name       : 'Forest',
      description: 'Natural and serene',
      type       : PresentationThemeType.SYSTEM,
      isPublic   : true,
      userId     : null,
      themeData  : {
        colors: {
          light: {
            primary   : '#059669',
            secondary : '#047857',
            accent    : '#34D399',
            background: '#F0FDF4',
            text      : '#1F2937',
            heading   : '#064E3B',
            muted     : '#6B7280',
          },
          dark: {
            primary   : '#34D399',
            secondary : '#6EE7B7',
            accent    : '#10B981',
            background: '#064E3B',
            text      : '#E5E7EB',
            heading   : '#ECFDF5',
            muted     : '#9CA3AF',
          },
        },
        fonts: {
          heading: 'Bitter',
          body   : 'Source Sans Pro',
        },
        borderRadius: '0.75rem',
        transitions : {
          default: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        shadows: {
          light: {
            card  : '0 4px 12px rgba(5,150,105,0.08)',
            button: '0 3px 8px rgba(5,150,105,0.15)',
          },
          dark: {
            card  : '0 4px 12px rgba(52,211,153,0.15)',
            button: '0 3px 8px rgba(52,211,153,0.2)',
          },
        },
      },
    },
  ]

  for (const theme of presetThemes) {
    const exists = await prisma.presentationTheme.findFirst({
      where: {
        name  : theme.name,
        userId: null,
      },
    })

    if (!exists) {
      await prisma.presentationTheme.create({
        data: {
          ...theme,
          userId: null,
        },
      })
    }
  }
}

async function main() {
  await seedThemes()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
