---
title: 给 Valaxy 的 Markdown 加点料
date: 2024-07-06 11:49:23
categories: Valaxy 笔记
tags:
  - valaxy
  - dev
  - typescript
  - markdown-it
---

和 `vitepress` 一样，`Valaxy` 也采用了 `markdown-it` 用于 `markdown` 解析，这使得我们可以对语法进行扩展。

<!-- more -->

## 实现内容分组

`vitepress` 默认通过 `code-group` 实现了代码分组：

```` md
::: code-group

```js [Javascript]
const a = 1;
```

```ts [TypeScript]
const a: number = 1;
```
:::
````

效果如下：

::: code-group

```js [Javascript]
const a = 1;
```

```ts [TypeScript]
const a: number = 1;
```
:::

不过我们可以更进一步，实现内容分组：

````md
:::: content-group

::: tab [TypeScript]
这是用 TypeScript 写的内容！
```ts
const a: number = 1;
```
:::

::: tab [Javascript]
这是用 Javascript 写的内容！
```js
const a = 1;
```
:::

::::
````

:::: content-group

::: tab [TypeScript]
这是用 TypeScript 写的内容！
```ts
const a: number = 1;
```
:::

::: tab [Javascript]
这是用 Javascript 写的内容！
```js
const a = 1;
```
:::

::::

## 链接美化和 Wayback Machine 支持

形如 `gh:BlueGlassBlock` 和 `@BlueGlassBlock` 的链接会被美化：gh:BlueGlassBlock @BlueGlassBlock（使用 `linkify-it` 插件）。

同时，一些网站前会加上对应的图标，以下是一些实例：

[GitHub 用户](https://github.com/gvanrossum)（Guido van Rossum）

[GitHub 仓库](https://github.com/vuejs/core)（Vue.js）

[GitHub 提交](https://github.com/python/cpython/commit/de6981680bcf6496e5996a853b2eaa700ed59b2c)（Python `_pylong` 模块）

[Twitter 用户](https://twitter.com/OnlyXuanwo)

[Twitter 帖子](https://x.com/OnlyXuanwo/status/1809556803245731957)

除此之外，用 [`Wayback Machine`](https://web.archive.org) 缓存的链接会被自动替换为正常链接：

[比如这份 Vue.js 文档的存档](https://web.archive.org/web/20240211041246/https://cn.vuejs.org/guide/essentials/computed#computed-caching-vs-methods)