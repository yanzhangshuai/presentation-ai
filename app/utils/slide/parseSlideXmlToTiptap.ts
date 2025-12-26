// utils/slide/parseSlideXmlToTiptap.ts

import { uniqueId } from 'lodash-es'

import type { LayoutType, PresentationSlide, SlideNode, TextNode } from '~/types/presentation'

/* ---------------------------------- */
/*              Types                 */
/* ---------------------------------- */

// export interface SlideParseResult {
//   layout?   : 'left' | 'right' | 'vertical' | 'background'
//   rootImage?: {
//     query: string
//     url? : string
//   }
//   content: JSONContent[]
// }

interface XMLNode {
  tag       : string
  attributes: Record<string, string>
  content   : string
  children  : XMLNode[]
}

/* ---------------------------------- */
/*           Public API               */
/* ---------------------------------- */

export function parseSlideXmlToTiptap(
  xml: string,
): PresentationSlide {
  const root = parseXML(stripPresentation(xml))

  const section = root.children.find(
    n => n.tag.toUpperCase() === 'SECTION',
  )

  if (!section) {
    return {
      id    : uniqueId('slide_'),
      layout: 'left',
      doc   : { type: 'doc', content: [] },
    }
  }

  const layout = parseLayout(section.attributes.layout)
  let rootImage: PresentationSlide['rootImage']

  const content: SlideNode[] = []

  for (const child of section.children) {
    // root-level image (用于封面 / 背景)
    if (child.tag.toUpperCase() === 'IMG') {
      const query = child.attributes.query
      if (query && !rootImage) {
        rootImage = {
          query,
          url: child.attributes.url || child.attributes.src,
        }
      }
      continue
    }

    const node = xmlNodeToTiptap(child)
    if (node)
      content.push(node)
  }

  return {
    id       : uniqueId('slide_'),
    layout,
    ...(rootImage ? { rootImage } : {}),
    doc      : { type: 'doc', content },
    alignment: section.attributes.alignment as
    | 'start'
    | 'center'
    | 'end'
    | undefined,
    bgColor: section.attributes.bgColor || undefined,
    width  : section.attributes.width as 'S' | 'M' | 'L' | undefined,
  }
}

/* ---------------------------------- */
/*        XML → TipTap mapping        */
/* ---------------------------------- */

function xmlNodeToTiptap(node: XMLNode): SlideNode | null {
  const tag = node.tag.toUpperCase()

  switch (tag) {
    case 'H1':
    case 'H2':
    case 'H3':
    case 'H4':
    case 'H5':
    case 'H6':
      return {
        attrs  : { id: uniqueId(), level: Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6 },
        type   : 'heading',
        content: parseInline(node),
      }

    case 'P':
      return {
        attrs  : { id: uniqueId() },
        type   : 'paragraph',
        content: parseInline(node),
      }

    case 'IMG':
      return {
        type : 'image',
        attrs: {
          id      : uniqueId(),
          imageUrl: node.attributes.url || node.attributes.src || '',
          query   : node.attributes.query || '',
          status  : 'placeholder',
        },
      }

    default:
      return null
  }
}

function parseInline(node: XMLNode): TextNode[] {
  const result: TextNode[] = []

  if (node.content.trim()) {
    result.push({
      type: 'text',
      text: node.content.trim(),
    })
  }

  for (const child of node.children) {
    const tag = child.tag.toUpperCase()

    if (tag === 'B' || tag === 'STRONG') {
      result.push({
        type : 'text',
        text : child.content,
        marks: [{ type: 'bold' }],
      })
    }

    if (tag === 'I' || tag === 'EM') {
      result.push({
        type : 'text',
        text : child.content,
        marks: [{ type: 'italic' }],
      })
    }
  }

  return result.length ? result : [{ type: 'text', text: '' }]
}

/* ---------------------------------- */
/*           XML Parsing              */
/* ---------------------------------- */

function stripPresentation(xml: string): string {
  return xml
    .replace(/<PRESENTATION[^>]*>/gi, '')
    .replace(/<\/PRESENTATION>/gi, '')
    .trim()
}

function parseXML(xml: string): XMLNode {
  const root: XMLNode = {
    tag       : 'ROOT',
    attributes: {},
    content   : '',
    children  : [],
  }

  parseElement(xml, root)
  return root
}

function parseElement(xml: string, parent: XMLNode): void {
  let i = 0

  while (i < xml.length) {
    const lt = xml.indexOf('<', i)
    if (lt === -1) {
      parent.content += xml.slice(i)
      break
    }

    if (lt > i)
      parent.content += xml.slice(i, lt)

    const gt = xml.indexOf('>', lt)
    if (gt === -1)
      break

    const raw = xml.slice(lt + 1, gt)
    if (raw.startsWith('/'))
      return

    const [tag, ...rest] = raw.split(/\s+/)
    const attributes: Record<string, string> = {}

    rest
      .join(' ')
      .replace(/(\w+)="([^"]*)"/g, (_, k, v) => {
        attributes[k] = v
        return ''
      })

    const node: XMLNode = {
      tag     : tag!,
      attributes,
      content : '',
      children: [],
    }

    parent.children.push(node)
    i = gt + 1

    parseElement(xml.slice(i), node)

    const closeTag = `</${tag}>`
    const closeIndex = xml.indexOf(closeTag, i)

    if (closeIndex !== -1) {
      i = closeIndex + closeTag.length
    }
  }
}

function parseLayout(
  value?: string,
): LayoutType {
  if (!value) {
    return 'left'
  }

  const val = value.toLowerCase()
  switch (val) {
    case 'left':
    case 'right':
    case 'top':
    case 'bottom':
    case 'background':
    case 'none':
      return val as LayoutType
    default:
      return 'left'
  }
}
