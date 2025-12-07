import MarkdownIt from 'markdown-it'
import { Schema } from 'prosemirror-model'
import { MarkdownParser, MarkdownSerializer } from 'prosemirror-markdown'

/**
 * 大纲编辑器的 ProseMirror schema 定义
 * schema 定义了文档允许的节点类型以及它们的层级关系
 */
export const outlineSchema = new Schema({
  nodes: {
    // 根节点 doc，文档的顶层容器
    doc: {
      content: 'heading1 bullet_list', // ⭐ 仅允许包含 heading1 和 bullet_list
    },

    // 一级标题节点
    heading1: {
      group   : 'block',       // 属于块级元素
      content : 'text*',       // 可以包含任意数量的文本
      defining: true,          // 定义块元素（ProseMirror 内部使用）
      toDOM   : () => ['h1', 0], // 渲染成 <h1>
      parseDOM: [{ tag: 'h1' }], // 从 DOM <h1> 解析
    },

    // 无序列表
    bullet_list: {
      group   : 'block',       // 块级元素
      content : 'list_item+',  // 至少包含一个 list_item
      toDOM   : () => ['ul', { 'data-tight': 'true' }, 0], // 渲染成 <ul data-tight="true">
      parseDOM: [{ tag: 'ul' }], // 从 DOM <ul> 解析
    },

    // 列表项
    list_item: {
      content : 'paragraph',   // 列表项内只能包含一个段落
      toDOM   : () => ['li', 0], // 渲染成 <li>
      parseDOM: [{ tag: 'li' }], // 从 DOM <li> 解析
    },

    // 段落
    paragraph: {
      group   : 'block',       // 块级元素
      content : 'text*',       // 可以包含文本
      toDOM   : () => ['p', 0], // 渲染成 <p>
      parseDOM: [{ tag: 'p' }], // 从 DOM <p> 解析
    },

    // 文本节点
    text: {
      group: 'inline',         // 行内元素
    },
  },
})

/**
 * 大纲编辑器的 Markdown 解析器
 * 将 Markdown 文本解析成 ProseMirror 节点
 */
export const outlineParser = new MarkdownParser(
  outlineSchema,               // 使用自定义的 schema
  new MarkdownIt('commonmark', {}), // 使用 commonmark Markdown 解析器
  {
    // 对应 Markdown 的 heading
    heading: {
      block   : 'heading1',    // 映射为 heading1 节点
      getAttrs: (tok) => {
        if (tok.tag !== 'h1')  // 仅解析 h1
          return false
        return {}
      },
    },

    bullet_list: {
      block: 'bullet_list',    // 映射为 bullet_list 节点
    },

    list_item: {
      block: 'list_item',      // 映射为 list_item 节点
    },

    paragraph: {
      block: 'paragraph',      // 映射为 paragraph 节点
    },

    text: {
      node: 'text',            // 映射为 text 节点
    },
  },
)

/**
 * 大纲编辑器的 Markdown 序列化器
 * 将 ProseMirror 节点序列化回 Markdown 文本
 */
export const outlineSerializer = new MarkdownSerializer(
  {
    // 根节点 doc：渲染内部内容
    doc(state, node) {
      state.renderContent(node)
    },

    // 一级标题
    heading1(state, node) {
      state.write('# ')          // 写入 Markdown 一级标题符号
      state.renderInline(node)   // 渲染标题内部文本
      state.closeBlock(node)     // 换行结束
    },

    // 无序列表
    bullet_list(state, node) {
      state.renderList(node, '  ', () => '- ')
      // 渲染列表，每级缩进两个空格，前缀为 '- '
    },

    // 列表项
    list_item(state, node) {
      state.renderInline(node)   // 渲染列表项内容
    },

    // 段落
    paragraph(state, node) {
      state.renderInline(node)   // 渲染段落文本
      state.closeBlock(node)     // 换行
    },

    // 文本节点
    text(state, node) {
      state.text(node.text!)     // 写入文本内容
    },
  },
  {
    // 第二个参数可以定义 mark 的序列化，这里为空
  },
)
