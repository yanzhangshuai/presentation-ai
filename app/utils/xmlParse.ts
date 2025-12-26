import { v4 as uuid } from 'uuid'

import type { HeadingNode, ImageNode, LayoutType, ListItemNode, ParagraphNode, PColumnNode, PColumnsNode, PListItemNode, PListNode, PresentationSlide, RootImage, SlideNode, TextNode } from '~/types/presentation'

function stripXmlCodeBlock(input: string): string {
  let result = input.trim()
  if (result.startsWith('```xml')) {
    result = result.slice(6).trimStart()
  }
  if (result.endsWith('```')) {
    result = result.slice(0, -3).trimEnd()
  }
  return result
}

export class SlideParser {
  private buffer           : string = ''
  private lastInputLength  : number = 0
  private completedSections: string[] = []
  private parsedSlides     : PresentationSlide[] = []

  private sectionMap = new Map<string, string>()
  private latestContent: string = ''

  /**
   *  解析内容块
   * @param chunk
   * @returns
   */
  public parseChunk(chunk: string): PresentationSlide[] {
    chunk = stripXmlCodeBlock(chunk)

    this.latestContent = chunk

    // 检查是否为完整内容
    const isFullContent
      = chunk.length >= this.lastInputLength
        && chunk.substring(0, this.lastInputLength)
        === this.buffer.substring(0, this.lastInputLength)

    if (isFullContent && this.lastInputLength > 0) {
      // 只处理新增部分
      this.buffer = this.buffer + chunk.substring(this.lastInputLength)
    }
    else {
      // 处理整个内容
      this.buffer = chunk
    }

    // 更新 lastInputLength
    this.lastInputLength = chunk.length

    this.extractCompleteSections()

    // Process completed sections
    const newSlides = this.processSections()

    return newSlides
  }

  public finalize(): PresentationSlide[] {
    try {
      // Extract any complete sections first
      this.extractCompleteSections()

      // Check if we still have a partial section
      let remainingBuffer = this.buffer.trim()

      // Skip PRESENTATION tag if present
      if (remainingBuffer.startsWith('<PRESENTATION')) {
        const tagEndIdx = remainingBuffer.indexOf('>')
        if (tagEndIdx !== -1) {
          remainingBuffer = remainingBuffer.substring(tagEndIdx + 1).trim()
        }
      }

      if (remainingBuffer.startsWith('<SECTION')) {
        // We have an incomplete section, force close it
        const fixedSection = `${remainingBuffer}</SECTION>`
        this.completedSections.push(fixedSection)
      }

      // Process all sections
      const finalSlides = this.processSections()

      // Clear the generating mark tracking for completed content
      this.latestContent = ''

      return finalSlides
    }
    catch (e) {
      console.error('Error during finalization:', e)
      return []
    }
  }

  public getAllSlides(): PresentationSlide[] {
    return this.parsedSlides
  }

  private extractCompleteSections() {
    let startIdx = 0
    let extractedSectionEndIdx = 0

    // 处理 PRESENTATION 标签及其后的注释
    const presentationStartIdx = this.buffer.indexOf('<PRESENTATION')
    if (presentationStartIdx !== -1 && presentationStartIdx < 10) {
      // 找到<PRESENTATION>标签，跳过它
      const tagEndIdx = this.buffer.indexOf('>', presentationStartIdx)
      if (tagEndIdx !== -1) {
        // 跳过完整的起始标签，包括任何属性
        startIdx = tagEndIdx + 1

        // 也跳过 PRESENTATION 标签后的任何注释
        const commentStartIdx = this.buffer.indexOf('<!--', startIdx)
        if (commentStartIdx !== -1 && commentStartIdx < startIdx + 20) {
          const commentEndIdx = this.buffer.indexOf('-->', commentStartIdx)
          if (commentEndIdx !== -1) {
            startIdx = commentEndIdx + 3
          }
        }
      }
    }

    while (true) {
      // 查找下一个 SECTION 起始标签
      const sectionStartIdx = this.buffer.indexOf('<SECTION', startIdx)
      if (sectionStartIdx === -1)
        break

      // 查找对应的结束标签，或另一个 SECTION 起始标签
      const sectionEndIdx = this.buffer.indexOf('</SECTION>', sectionStartIdx)
      const nextSectionIdx = this.buffer.indexOf(
        '<SECTION',
        sectionStartIdx + 1,
      )

      // 如果找到了完整的 SECTION 结束标签
      if (
        sectionEndIdx !== -1
        && (nextSectionIdx === -1 || sectionEndIdx < nextSectionIdx)
      ) {
        // 提取完整的 SECTION
        const completeSection = this.buffer.substring(
          sectionStartIdx,
          sectionEndIdx + '</SECTION>'.length,
        )

        this.completedSections.push(completeSection)
        startIdx = sectionEndIdx + '</SECTION>'.length
        extractedSectionEndIdx = startIdx
      }
      // 如果遇到下一个 SECTION 起始标签，说明当前 SECTION 不完整
      else if (nextSectionIdx !== -1) {
        // Force close the current section
        const partialSection = this.buffer.substring(
          sectionStartIdx,
          nextSectionIdx,
        )

        // 检查是否有实际内容
        if (
          partialSection.includes('<H1>')
          || partialSection.includes('<H2>')
          || partialSection.includes('<H3>')
          || partialSection.includes('<PYRAMID>')
          || partialSection.includes('<ARROWS>')
          || partialSection.includes('<TIMELINE>')
          || partialSection.includes('<P>')
          || partialSection.includes('<ICON>')
          || partialSection.includes('<IMG')
        ) {
          // 添加关闭标签并处理它
          this.completedSections.push(`${partialSection}</SECTION>`)
        }

        startIdx = nextSectionIdx
        extractedSectionEndIdx = nextSectionIdx
      }
      // 如果这是缓冲区中的最后一个部分且仍不完整
      else {
        // 我们将等待更多数据或在 finalize() 中处理
        break
      }
    }

    // 更新缓冲区，移除已处理的部分
    if (extractedSectionEndIdx > 0) {
      this.buffer = this.buffer.substring(extractedSectionEndIdx)
    }
  }

  private processSections(): PresentationSlide[] {
    if (this.completedSections.length === 0) {
      return []
    }

    const newSlides = this.completedSections.map(item => this.parseSlide(item))
    this.parsedSlides = [...this.parsedSlides, ...newSlides]
    this.completedSections = []

    return newSlides
  }

  /**
   * 将 section XML 转为 PresentationSlide
   * @param sectionXml section 的 XML 字符串
   * @returns PresentationSlide 对象
   */
  private parseSlide(sectionXml: string): PresentationSlide {
    // 将xml字符串转为XMLNode 对象
    const rootNode = parseXML(sectionXml)

    const sectionNode = rootNode.children.find(child => child.tag.toUpperCase() === 'SECTION')
    if (!sectionNode) {
      return {
        id       : uuid(),
        doc      : { type: 'doc', content: [] },
        layout   : 'none',
        alignment: 'center',

      }
    }

    const sectionIdentifier = this.generateSectionIdentifier(sectionNode)

    // 检查 section ID
    let slideId: string
    if (this.sectionMap.has(sectionIdentifier)) {
      slideId = this.sectionMap.get(sectionIdentifier)!
    }
    else {
      slideId = uuid()
      this.sectionMap.set(sectionIdentifier, slideId)
    }

    const layoutType = parseLayout(sectionNode.attributes.layout)
    const rootImage = parseRootImage(sectionNode, layoutType)

    const elements: SlideNode[] = []

    for (const childNode of sectionNode.children) {
      // 处理Div容器
      if (childNode.tag.toUpperCase() === 'DIV') {
        const items = childNode.children
          .map((child) => {
            return this.processTopLevelNode(child)
          })
          .filter(Boolean) as SlideNode[]

        elements.push(...items)
      }
      else {
        const node = this.processTopLevelNode(childNode)
        node && elements.push(node)
      }
    }

    return {
      id       : slideId,
      layout   : layoutType,
      rootImage,
      doc      : { type: 'doc', content: elements },
      alignment: 'center',
    }
  }

  /**
   *  获取节点的文本内容
   * @param node
   */
  private getTextContent(node: XMLNode, trim = true): string {
    let text = trim ? node.content.trim() : node.content

    // 递归解析子节点
    for (const child of node.children) {
      text += this.getTextContent(child, false)
    }

    return text
  }

  /**
   * 处理 Div 节点
   */
  private processDiv(node: XMLNode): SlideNode[] {
    const children = this.processNodes(node.children)

    if (children?.length) {
      return children
    }
    const nodeContent = node.content?.trim() ?? ''
    return [this.createParagraphFormText(nodeContent)]
  }

  /**
   * 处理多个节点
   */
  private processNodes(nodes: XMLNode[]): SlideNode[] {
    const slideNodes: SlideNode[] = []

    //
    for (let i = 0; i < nodes.length;) {
      const node = nodes[i]
      if (!node) {
        i += 1
        continue
      }

      const tag = node.tag.toUpperCase()

      if (tag === 'LI') {
        const liNodes: XMLNode[] = []
        let j = i
        while (j < nodes.length) {
          const candidate = nodes[j]
          if (!candidate) {
            break
          }

          if (candidate.tag.toUpperCase() !== 'LI') {
            break
          }

          liNodes.push(candidate)
          j += 1
        }
        const listItems = this.createListItemNode(liNodes)
        slideNodes.push(...listItems)

        i = j
        continue
      }

      const processedNode = this.processNode(node)

      if (processedNode) {
        slideNodes.push(processedNode)
      }

      i += 1
    }

    return slideNodes
  }

  private processNode(node: XMLNode): SlideNode | null {
    const tag = node.tag.toUpperCase()
    switch (tag) {
      case 'H1':
      case 'H2':
      case 'H3':
      case 'H4':
      case 'H5':
      case 'H6':
        return this.createHeading(tag.toLowerCase() as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', node)
      case 'P':
        return this.createParagraph(node)
      case 'IMG':
        return this.createImage(node)
      case 'COLUMNS':
        return this.createColumns(node)
      case 'BULLETS':
        return this.createBullets(node)
      // case 'DIV':
      //   // 处理 Div 内部的节点
      //   return this.processDiv(node) || null
      default:
        // if (node.children.length > 0) {
        //   return this.createParagraph(node)
        // }
        return null
    }
  }

  private processTopLevelNode(node: XMLNode): SlideNode | null {
    const tag = node.tag.toUpperCase()

    switch (tag) {
      case 'H1':
      case 'H2':
      case 'H3':
      case 'H4':
      case 'H5':
      case 'H6':
        return this.createHeading(tag.toLowerCase() as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', node)
      case 'P':
        return this.createParagraph(node)

      case 'IMG':
        return this.createImage(node)
      case 'COLUMNS':
        return this.createColumns(node)
      case 'BULLETS':
        return this.createBullets(node)
      default:
        // TODO: 处理其他节点类型
        return null
    }
  }

  /**
   * 创建标题节点
   * @param level
   * @param node
   */
  private createHeading(level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', node: XMLNode): HeadingNode {
    return {
      type : 'heading',
      attrs: {
        id   : uuid(),
        level: Number.parseInt(level.substring(1)) as 1 | 2 | 3 | 4 | 5 | 6,
      },
      content: this.getTextDescendants(node),
    }
  }

  /**
   * 创建段落节点
   * @param node
   */
  private createParagraph(node: XMLNode): ParagraphNode {
    return {
      type : 'paragraph',
      attrs: {
        id: uuid(),
      },
      content: this.getTextDescendants(node),
    }
  }

  /**
   * 创建简单文本段落节点
   */
  private createParagraphFormText(text: string): ParagraphNode {
    return {
      type : 'paragraph',
      attrs: {
        id: uuid(),
      },
      content: [{
        type : 'text',
        text,
        marks: this.shouldGeneratingMark(text) ? [{ type: 'generating' }] : [],
      }],
    }
  }

  /**
   * 创建图片节点
   * @param node
   */
  private createImage(node: XMLNode): ImageNode | null {
    if (!node.originalTagContent) {
      return null
    }

    const url = node.attributes.url ?? node.attributes.src ?? ''

    const queryStart = node.originalTagContent.indexOf('query=')
    if (queryStart === -1) {
      return null
    }

    const afterQuery = node.originalTagContent.substring(queryStart + 6)
    if (afterQuery.length === 0) {
      return null
    }

    const quoteChar = afterQuery.charAt(0)
    if (quoteChar !== '"' && quoteChar !== '\'') {
      return null
    }

    const endQuoteIdx = afterQuery.indexOf(quoteChar, 1)
    if (endQuoteIdx === -1) {
      return null
    }

    const query = afterQuery.substring(1, endQuoteIdx)
    if (!query || query.trim().length < 3) {
      return null
    }

    return {
      type : 'image',
      attrs: {
        id      : uuid(),
        imageUrl: url,
        query,
        status  : 'placeholder',
      },
    }
  }

  /**
   * 创建多列节点
   * @param node
   */
  private createColumns(node: XMLNode): PColumnsNode {
    const items: PColumnNode[] = []

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]

      if (child?.tag?.toUpperCase() === 'DIV') {
        items.push({
          type   : 'p_column',
          content: this.processNodes(child.children) as (ParagraphNode | HeadingNode)[],
          attrs  : {
            id   : uuid(),
            index: i,

          },
        })
      }
    }

    return {
      type   : 'p_columns',
      content: items,
      attrs  : {
        id       : uuid(),
        width    : 'M',
        count    : items.length,
        direction: 'horizontal',

      },
    }
  }

  private createBullets(node: XMLNode): PListNode {
    const items: PListItemNode[] = []
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]
      if (child?.tag?.toUpperCase() === 'DIV') {
        items.push({
          type   : 'p_list_item',
          content: this.processNodes(child.children) as (ParagraphNode | HeadingNode)[],
          attrs  : {
            id   : uuid(),
            index: i,
          },
        })
      }
    }

    return {
      type   : 'p_list',
      content: items,
      attrs  : {
        id       : uuid(),
        width    : 'M',
        count    : items.length,
        direction: 'horizontal',
      },
    }
  }

  /**
   * 创建列表项节点
   */
  private createListItemNode(liNodes: XMLNode[], isOrdered = false): ListItemNode[] {
    const items: ListItemNode[] = []

    for (const li of liNodes) {
      //
      let itemChildren = this.processNodes(li.children) as (ParagraphNode | HeadingNode)[]

      const contentText = li.content.trim() ?? ''

      if (!itemChildren?.length && contentText) {
        //
        itemChildren = [this.createParagraphFormText(contentText)]
      }

      else if (!itemChildren?.length) {
        itemChildren = [this.createParagraphFormText('')]
      }

      else {
        items.push({
          type : 'list_item',
          attrs: {
            id       : uuid(),
            index    : items.length,
            styleType: isOrdered ? 'decimal' : 'disc',
          },
          content: itemChildren,
        })
      }
    }

    return items
  }

  /**
   * 获取节点下的所有文本子节点
   */
  private getTextDescendants(node: XMLNode): TextNode[] {
    const textNodes: TextNode[] = []

    // 保留原始文本内容
    if (node.content) {
      const trimmedText = node.content
      textNodes.push({ type: 'text', text: trimmedText, marks: this.shouldGeneratingMark(trimmedText) ? [{ type: 'generating' }] : [] })
    }

    for (const child of node.children) {
      const childTag = child.tag.toUpperCase()

      if (childTag === 'B' || childTag === 'STRONG') {
        // 加粗文本
        const content = this.getTextContent(child, false)
        textNodes.push({
          type : 'text',
          text : content,
          marks: [
            { type: 'bold' },
            this.shouldGeneratingMark(content) && { type: 'generating' },
          ].filter(Boolean) as Array<{ type: 'bold' | 'generating' }>,
        })
      }
      else if (childTag === 'I' || childTag === 'EM') {
        // 斜体文本
        const content = this.getTextContent(child, false)
        textNodes.push({
          type : 'text',
          text : content,
          marks: [
            { type: 'italic' },
            this.shouldGeneratingMark(content) && { type: 'generating' },
          ].filter(Boolean) as Array<{ type: 'italic' | 'generating' }>,
        })
      }
      else if (childTag === 'U') {
        // 下划线文本
        const content = this.getTextContent(child, false)
        textNodes.push({
          type : 'text',
          text : content,
          marks: [
            { type: 'underline' },
            this.shouldGeneratingMark(content) && { type: 'generating' },
          ].filter(Boolean) as Array<{ type: 'underline' | 'generating' }>,
        })
      }
      else if (childTag === 'STRIKE' || childTag === 'S') {
        // 删除线文本
        const content = this.getTextContent(child, false)
        textNodes.push({
          type : 'text',
          text : content,
          marks: [
            { type: 'strike' },
            this.shouldGeneratingMark(content) && { type: 'generating' },
          ].filter(Boolean) as Array<{ type: 'strike' | 'generating' }>,
        })
      }
      else {
        // 递归处理其他子节点
        textNodes.push(...this.getTextDescendants(child))
      }
    }

    // Clean up empty text nodes and combine adjacent text nodes with same formatting
    const combinedTexts: TextNode[] = []
    for (const textNode of textNodes) {
      if (textNode.text.trim() === '') {
        continue
      }

      const lastNode = combinedTexts[combinedTexts.length - 1]
      if (
        lastNode
        && JSON.stringify(lastNode.marks) === JSON.stringify(textNode.marks)
      ) {
        // 合并相邻的文本节点
        lastNode.text += textNode.text
      }
      else {
        combinedTexts.push(textNode)
      }
    }

    return combinedTexts?.length ? combinedTexts : [{ type: 'text', text: '' }]
  }

  /**
   * 判断文本是否处于生成中
   * @param text
   * @returns
   */
  private shouldGeneratingMark(text: string): boolean {
    const trimmedText = text.trim()
    if (!trimmedText) {
      return false
    }

    // 如果文本不在最新内容中，则认为不在生成
    const textPos = this.latestContent.lastIndexOf(trimmedText)
    if (textPos === -1) {
      return false
    }

    // 如果文本在最新内容的结尾处，则认为还在生成
    const textEnd = textPos + trimmedText.length
    if (textEnd >= this.latestContent.length) {
      return true
    }

    // 如果后面紧跟着不是标签，则认为还在生成
    const afterText = this.latestContent.substring(textEnd).trim()
    return !afterText.startsWith('<')
  }

  /**
   * 生成 section 的唯一标识符
   */
  private generateSectionIdentifier(sectionNode: XMLNode): string {
    // 使用H1内容作为标识符
    const h1Node = sectionNode.children.find(child => child.tag.toUpperCase() === 'H1')
    if (h1Node) {
      const headingContent = this.getTextContent(h1Node)

      if (headingContent.trim().length > 0) {
        return `heading-${headingContent.trim()}`
      }
    }

    let fingerprint = ''

    // 增加section 属性
    const attrKeys = Object.keys(sectionNode.attributes).sort()
    if (attrKeys.length > 0) {
      fingerprint += attrKeys
        .map(key => `${key}=${sectionNode.attributes[key]}`)
        .join(';')
    }

    // 增加前三个子标签
    const childTags = sectionNode.children.slice(0, 3).map(child => child.tag.toUpperCase())

    if (childTags.length > 0) {
      fingerprint += `|${childTags.join('-')}`
    }

    if (fingerprint.length < 5) {
      let hash = 0
      const fullContent = sectionNode.originalTagContent ?? ''

      for (let i = 0; i < fullContent.length; i++) {
        const char = fullContent.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32bit integer
      }

      fingerprint = `content-hash-${Math.abs(hash)}`
    }

    return fingerprint
  }

  /**
   * Reset the parser state
   */
  public reset(): void {
    this.buffer = ''
    this.completedSections = []
    this.parsedSlides = []
    this.lastInputLength = 0
    this.latestContent = ''
    // Don't reset sectionIdMap to maintain IDs across reset calls
  }
}

function parseXML(xmlString: string): XMLNode {
  const rootNode: XMLNode = {
    tag       : 'ROOT',
    attributes: {},
    content   : '',
    children  : [],
  }

  let processedXml = xmlString

  // 处理代码块标记
  const openStartIdx = processedXml.indexOf('<PRESENTATION')
  if (openStartIdx !== -1) {
    const openEndIdx = processedXml.indexOf('>', openStartIdx)
    if (openEndIdx !== -1) {
      // 移除<PRESENTATION>标签
      processedXml = processedXml.slice(0, openStartIdx)
        + processedXml.slice(openEndIdx + 1)
    }
  }

  // 移除</PRESENTATION>标签
  processedXml = processedXml.replace('</PRESENTATION>', '')

  try {
    let fixedXml = processedXml

    // 确保所有打开的标签都有对应的关闭标签
    if (fixedXml.includes('<SECTION') && !fixedXml.endsWith('</SECTION>')) {
      fixedXml += '</SECTION>'
    }

    parseElement(fixedXml, rootNode)
  }
  catch (error) {
    // 返回一个表示错误的节点
    let withoutPresentation = xmlString

    const openStartIdx
      = withoutPresentation.indexOf('<PRESENTATION')
    if (openStartIdx !== -1) {
      const openEndIdx = withoutPresentation.indexOf(
        '>',
        openStartIdx,
      )
      if (openEndIdx !== -1) {
        //
        withoutPresentation
          = withoutPresentation.substring(0, openStartIdx)
            + withoutPresentation.substring(openEndIdx + 1)
      }
    }

    withoutPresentation = withoutPresentation.replace('</PRESENTATION>', '')

    const sections = withoutPresentation.split(/<\/?SECTION[^>]*>/)
    let inSection = false

    for (const part of sections) {
      if (inSection && part.trim() !== '') {
        const sectionNode: XMLNode = {
          tag       : 'SECTION',
          attributes: {},
          content   : '',
          children  : [],
        }

        // Just capture the raw content
        sectionNode.content = part.trim()
        rootNode.children.push(sectionNode)
      }

      inSection = !inSection
    }
  }

  return rootNode
}

function parseElement(xml: string, parentNode: XMLNode): void {
  let currentIdx = 0

  while (currentIdx < xml.length) {
    const tagStartIdx = xml.indexOf('<', currentIdx)

    // 没有更多标签，添加剩余内容并退出
    if (tagStartIdx === -1) {
      parentNode.content += xml.substring(currentIdx).trim()
      break
    }

    // 处理标签
    if (tagStartIdx > currentIdx) {
      parentNode.content += xml
        .substring(currentIdx, tagStartIdx)
        .trim()
    }

    const tagEndIdx = xml.indexOf('>', tagStartIdx)

    // 标签不完整，添加剩余内容并退出
    if (tagEndIdx === -1) {
      parentNode.content += xml
        .substring(tagStartIdx)
        .trim()
      break
    }

    const tagContent = xml
      .substring(tagStartIdx + 1, tagEndIdx)
      .trim()

    // 处理关闭标签
    if (tagContent.startsWith('/')) {
      const closingTag = tagContent.substring(1).trim()

      if (closingTag.toUpperCase() === parentNode.tag.toUpperCase()) {
        // 关闭当前节点，返回上级
        currentIdx = tagEndIdx + 1
        break
      }
      else {
        // 不匹配的关闭标签，忽略
        currentIdx = tagEndIdx + 1
        continue
      }
    }

    // 跳过注释
    if (tagContent.startsWith('!--')) {
      const commentEndIdx = xml.indexOf('-->', tagStartIdx)
      currentIdx = commentEndIdx !== -1
        ? commentEndIdx + 3
        : xml.length
      continue
    }

    let tagName = ''
    let attrString = ''

    // 处理标签
    const firstSpaceIdx = tagContent.indexOf(' ')

    if (firstSpaceIdx === -1) {
      // 只有标签名，没有属性
      tagName = tagContent
      attrString = ''
    }
    else {
      // 有标签名和属性
      tagName = tagContent.substring(0, firstSpaceIdx).trim()
      attrString = tagContent.substring(firstSpaceIdx + 1).trim()
    }

    // 跳过 special 标签
    if (tagName.startsWith('?') || tagName.startsWith('!')) {
      currentIdx = tagEndIdx + 1
      continue
    }

    // 自闭合标签
    const selfClosing = tagContent.endsWith('/')
    if (selfClosing) {
      tagName = tagName.replace(/\/$/, '').trim()
    }

    // 属性
    const attributes: Record<string, string> = {}
    let attrRemaining = attrString.trim()
    while (attrRemaining.length > 0) {
      // 查找下一个 '='
      const equalIdx = attrRemaining.indexOf('=')
      if (equalIdx === -1)
        break

      // 提取属性名和值
      const attrName = attrRemaining.substring(0, equalIdx).trim()
      attrRemaining = attrRemaining.substring(equalIdx + 1).trim()

      let attrValue = ''
      const quoteChar = attrRemaining.charAt(0)
      if (quoteChar === '"' || quoteChar === '\'') {
        // 属性值用引号包围
        const endQuoteIdx = attrRemaining.indexOf(quoteChar, 1)

        if (endQuoteIdx === -1) {
          attrValue = attrRemaining.substring(1).trim()
          attrRemaining = ''
        }
        else {
          attrValue = attrRemaining.substring(1, endQuoteIdx).trim()
          attrRemaining = attrRemaining.substring(endQuoteIdx + 1).trim()
        }
      }
      else {
        // 属性值没有引号包围
        const spaceIdx = attrRemaining.indexOf(' ')
        if (spaceIdx === -1) {
          attrValue = attrRemaining.trim()
          attrRemaining = ''
        }
        else {
          attrValue = attrRemaining.substring(0, spaceIdx).trim()
          attrRemaining = attrRemaining.substring(spaceIdx + 1).trim()
        }
      }

      attributes[attrName] = attrValue
    }

    // 创建新节点
    const newNode: XMLNode = {
      tag               : tagName,
      attributes,
      content           : '',
      children          : [],
      originalTagContent: xml.substring(tagStartIdx, tagEndIdx + 1),
    }

    // 添加到父节点
    parentNode.children.push(newNode)

    currentIdx = tagEndIdx + 1

    // 处理自闭合标签
    if (selfClosing) {
      continue
    }

    // 递归解析子节点
    parseElement(xml.substring(currentIdx), newNode)

    // 更新 currentIdx 到子节点处理后的新位置
    const closingTag = `</${tagName}>`
    const closingTagIdx = xml.indexOf(
      closingTag,
      currentIdx,
    )
    if (closingTagIdx !== -1)
      currentIdx = closingTagIdx + closingTag.length
    else
      // 没有找到关闭标签，退出
      break
  }
}

interface XMLNode {
  tag                : string
  attributes         : Record<string, string>
  content            : string
  children           : XMLNode[]
  originalTagContent?: string // Added to store the original tag content for validation
}

/**
 *  解析布局类型
 * @param value
 * @returns
 */
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

/**
 *  解析根图片信息
 * @param xmlNode
 * @param layoutType
 * @returns
 */
function parseRootImage(xmlNode: XMLNode, layoutType: LayoutType): RootImage | undefined {
  if (!xmlNode.originalTagContent) {
    return undefined
  }

  let rootImage: RootImage | undefined

  const queryStart = xmlNode.originalTagContent.indexOf('query=')
  if (queryStart !== -1) {
    const afterQuery = xmlNode.originalTagContent.substring(queryStart + 6)

    // 提取 query 值
    if (afterQuery.length > 0) {
      const quoteChar = afterQuery.charAt(0)
      if (quoteChar === '"' || quoteChar === '\'') {
        const endQuoteIdx = afterQuery.indexOf(quoteChar, 1)

        //
        if (endQuoteIdx !== -1) {
          const extractedQuery = afterQuery.substring(1, endQuoteIdx)

          if (extractedQuery?.trim()?.length && !rootImage) {
            rootImage = {
              query: extractedQuery,
              url  : '',
              layoutType,
            }
          }
        }
      }
    }
  }

  return rootImage
}
