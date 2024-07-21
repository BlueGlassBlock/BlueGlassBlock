---
title: 给 Valaxy 修复的第一个 Bug
date: 2024/07/05 21:38:00
updated: 2024.07.05 22:31:00
categories: Valaxy 笔记
tags:
  - valaxy
  - dev
  - vue
---

关于博客的 about 都没落地就开始给上游修 bug 这回事。

<!-- more -->

## 缘起

首先，懒人如我选择了 [valaxy-theme-yun](https://yun.valaxy.site)，因为它是官方支持、开箱即用的博客主题。

很快啊，一打开 `Hello, Valaxy!` 示例页，我们今天的主角 `YunMdTimeWarning` 组件便映入眼帘。
它在你的博客内容很久未更新时会贴心地提醒读者注意甄别，但是**在切换语言后它的 {ago} 部分不会更新**！

## 诊断问题

对于我这样一个前端白痴来说，`Vue` 总是跟“响应式”挂钩的，怎么在这样一个本应平滑处理好的地方出岔子？

话不多说，查代码：

```vue:line-numbers
<script lang="ts" setup>
const updated = computed(() => fm.value.updated || fm.value.date || new Date())
const ago = computed(() => {
  const fromNow = formatDistanceToNow(updated.value, { addSuffix: true }) // [!code warning]
  if (/^\d/.test(fromNow))
    return ` ${fromNow}`
  else
    return fromNow
})
// snipped
</script>

<template>
  <blockquote v-if="time_warning" class="yun-time-warning" op="80">
    {{ t('post.time_warning', { ago }) }} // [!code warning]
  </blockquote>
</template>
```

这使得我的目光锁定到了 `ago` 变量上，进而关注到 `computed` 和 `formatDistanceToNow`。

查阅 [`Vue` 的文档](https://cn.vuejs.org/guide/essentials/computed)：
> Vue 的计算属性会自动追踪响应式依赖。

好的，那么我们只要引入对 `locale` 的依赖就行了...

## 初步修复

```vue:line-numbers
<script lang="ts" setup>
const { t } = useI18n() // [!code --]
const { t, locale } = useI18n() // [!code ++]

const updated = computed(() => fm.value.updated || fm.value.date || new Date())
const ago = computed(() => {
  locale.value // 访问 locale.value 使 Vue 发觉 ago 对 locale 的依赖 // [!code ++]
  const fromNow = formatDistanceToNow(updated.value, { addSuffix: true })
  if (/^\d/.test(fromNow))
    return ` ${fromNow}`
  else
    return fromNow
})
</script>
```

ちょっと待って，你不觉得这样有点 *naive & magical* 吗？
`formatDistanceToNow` 到底是怎么自动切换它使用的 `locale` 的？
查阅 [`date-fns` 文档](https://date-fns.org/v3.6.0/docs/I18n)，它翻脸不承认自已有如此牛力，那肯定是 `Valaxy` 或 `Yun` 在动手脚了！
搜索 `valaxy` 代码，果不其然：

```ts
// https://github.com/YunYouJun/valaxy/blob/01fec2d4cd86285f6c90fdeeed2cb29d6369aa47/packages/valaxy/client/composables/locale.ts

import { enUS, zhCN } from 'date-fns/locale'

export function useLocale() {
  const { availableLocales, locale } = useI18n()
  const lang = useStorage('valaxy-locale', locale.value)
  // set date locale
  setDefaultOptions({ locale: locale.value === 'zh-CN' ? zhCN : enUS })

  const toggleLocales = () => {
    // change to some real logic
    const locales = availableLocales

    locale.value = locales[(locales.indexOf(locale.value) + 1) % locales.length]
    // for localStorage
    lang.value = locale.value

    // set date locale
    setDefaultOptions({ locale: locale.value === 'zh-CN' ? zhCN : enUS })

    if (isClient)
      document.documentElement.setAttribute('lang', locale.value)
  }

  return {
    lang,
    toggleLocales,
  }
}
```

好吧，云游君你既然只考虑中英双语（~~不过谁会天天用超过两种语言同时写博客啊~~），那我也入乡随俗了！

## 最后的修复

在我准备照搬上面的逻辑给 `YunMdTimeWarning` 进行修复时，我忽然想起这一行代码：

```ts
setDefaultOptions({ locale: locale.value === 'zh-CN' ? zhCN : enUS })
```

我合理怀疑其他使用 `date-fns` 的代码也有可能犯下上面的错误，然而我在 repo 搜了一圈只有这一处用法依赖了 `locale`。

## 一点后话

其实这个问题一按 <kbd>Ctrl</kbd> + <kbd>R</kbd> 就没了，不过感觉还是比较有意思的。
