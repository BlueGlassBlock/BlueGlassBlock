// ref vitepress
// src/node/markdown/plugins/containers.ts

import MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'

import { nanoid } from 'nanoid'

export function extractLang(info: string) {
  return info
    .trim()
    .replace(/=(\d*)/, '')
    .replace(/:(no-)?line-numbers({| |$|=\d*).*/, '')
    .replace(/(-vue|{| ).*$/, '')
    .replace(/^vue-html$/, 'template')
    .replace(/^ansi$/, '')
}

export function getAdaptiveThemeMarker(hasSingleTheme: boolean) {
  return hasSingleTheme ? '' : ' vp-adaptive-theme'
}


type ContainerArgs = [
  typeof container,
  string,
  { render: MarkdownIt.Renderer.RenderRule },
]

export function contentGroupPlugin(md: MarkdownIt, hasSingleTheme: boolean) {
  md.use(...createContentGroupRule(hasSingleTheme))
  md.use(...createTab(hasSingleTheme))
}

function createTab(hasSingleTheme: boolean): ContainerArgs {
  return [
    container,
    'tab',
    {
      render(tokens, idx, _options) {
        if (tokens[idx].nesting === 1) {
          return `<div class="content-tab ${getAdaptiveThemeMarker(hasSingleTheme)} ${tokens[idx].content}">\n`
        }
        return `</div>\n`
      },
    },
  ]
}

function createContentGroupRule(hasSingleTheme: boolean): ContainerArgs {
  return [
    container,
    'content-group',
    {
      render(tokens, idx) {
        if (tokens[idx].nesting === 1) {
          const name = nanoid(5)
          let count = 0
          let tabs = ''
          let checked = 'checked="checked"'

          for (
            let i = idx + 1;
            !(
              tokens[i].nesting === -1
              && tokens[i].type === 'container_content-group_close'
            );
            ++i
          ) {
            if (
              tokens[i].type === 'container_tab_open'

            ) {
              count++
              const title = tokens[i].info.match(/\[(.*)\]/)?.[1] || `Tab ${count}`

              const id = nanoid(7)
              tabs += `<input type="radio" name="group-${name}" id="tab-${id}" ${checked}><label for="tab-${id}">${title}</label>`

              if (checked)
                tokens[i].content = 'active'
              checked = ''
            }
          }


          return `<div class="content-group ${getAdaptiveThemeMarker(
            hasSingleTheme
          )}"><div class="tabs">${tabs}</div><div class="blocks">\n`
        }
        return `</div></div>\n`
      },
    },
  ]
}