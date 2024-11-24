import MarkdownIt from 'markdown-it'

export function wikiLinkPlugin(md: MarkdownIt) {
  const defaultOpenRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

  const defaultCloseRender = md.renderer.rules.link_close || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

  const EXTERNAL_LINK_RE = /^https?:\/\//
  const IN_DOCUMENT_LINK_RE = /^#/

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const renderResult = defaultOpenRender(tokens, idx, options, env, self)
    const href = tokens[idx].attrGet('href')
    if (!href || EXTERNAL_LINK_RE.test(href) || IN_DOCUMENT_LINK_RE.test(href)) {
      return renderResult
    }
    if (!env.wikiLink) {
      env.wikiLink = 0
    }
    env.wikiLink++
    return `<WikiLink :href='${JSON.stringify(href)}'>${renderResult}`
  }

  md.renderer.rules.link_close = function (tokens, idx, options, env, self) {
    const renderResult = defaultCloseRender(tokens, idx, options, env, self)
    if (env.wikiLink) {
      env.wikiLink--
      return renderResult + '</WikiLink>'
    }
    return renderResult
  }
}