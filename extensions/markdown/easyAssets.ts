import MarkdownIt from 'markdown-it'

export function easyAssetsPlugin(md: MarkdownIt) {
  const defaultImageRender = md.renderer.rules.image || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

  // replace $assets in relative links with article-name.assets/
  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    const srcIndex = token.attrIndex('src')
    const filePath: string = env.id
    const articleName = filePath.split('/').pop()!.replace(/.md$/, '')
    if (srcIndex >= 0) {
      let src = token.attrs![srcIndex][1]
      src = src.replace('$assets/', `${articleName}.assets/`)
      token.attrs![srcIndex][1] = src
    }
    return defaultImageRender(tokens, idx, options, env, self)
  }
}