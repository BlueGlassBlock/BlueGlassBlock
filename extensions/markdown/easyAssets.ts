import MarkdownIt from 'markdown-it'

export function easyAssetsPlugin(md: MarkdownIt) {
  const polyfill: MarkdownIt.Renderer.RenderRule = (tokens, idx, options, env, self) => {
    return self.renderToken(tokens, idx, options)
  }

  // replace $assets in relative links with article-name.assets/
  function createReplacer(attr: string, defaultFn: MarkdownIt.Renderer.RenderRule): MarkdownIt.Renderer.RenderRule {
    return (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const srcIndex = token.attrIndex(attr)
    const filePath: string = env.id
    const articleName = filePath.split('/').pop()!.replace(/.md$/, '')
    if (srcIndex >= 0) {
      let src = token.attrs![srcIndex][1]
      src = src.replace('$assets/', `${articleName}.assets/`)
      token.attrs![srcIndex][1] = src
    }
    return defaultFn(tokens, idx, options, env, self)
    }
  }

  md.renderer.rules.image = createReplacer('src', md.renderer.rules.image || polyfill)
  md.renderer.rules.link_open = createReplacer('href', md.renderer.rules.link_open || polyfill)
}