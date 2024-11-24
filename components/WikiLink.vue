<template>
  <span v-tooltip="{
    content: loadContent,
    loadingContent: t('wiki-link.loading'),
    theme: 'wiki-link',
    html: true,
  }" class="wiki-link-popper">
  <slot />
</span>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { vTooltip } from 'floating-vue'

const { t } = useI18n() // TODO: proper lang handling

const props = defineProps({
  href: String,
})

// from micromorph/src/utils.ts
// https://github.com/natemoo-re/micromorph/blob/main/src/utils.ts#L5
function _rebaseHtmlElement(el: Element, attr: string, newBase: string | URL) {
  const rebased = new URL(el.getAttribute(attr)!, newBase)
  el.setAttribute(attr, rebased.pathname + rebased.hash)
}

// https://github.com/jackyzha0/quartz/blob/main/quartz/util/path.ts#L106
function normalizeRelativeURLs(el: Element | Document, destination: string | URL) {
  el.querySelectorAll('[href^="./"], [href^="../"]').forEach((item) =>
    _rebaseHtmlElement(item, "href", destination),
  )
  el.querySelectorAll('[src^="./"], [src^="../"]').forEach((item) =>
    _rebaseHtmlElement(item, "src", destination),
  )
}

async function loadContent() {
  let href = props.href!
  const targetURL = new URL(href, window.location.href)
  targetURL.hash = ''
  targetURL.search = ''
  const response = await fetch(targetURL).catch((err) => console.error(err))

  if (!response) {
    return t('wiki-link.error')
  }
  const [contentType] = response.headers.get('Content-Type')!.split(';')

  if (contentType === 'text/html') {
    // treat as blog post
    const content = await response.text()
    const html = new DOMParser().parseFromString(content, 'text/html')
    normalizeRelativeURLs(html, targetURL)
    const article = html.querySelector('article')
    if (article) {
      return article.outerHTML
    }
  }
  return t('wiki-link.error')
}
</script>