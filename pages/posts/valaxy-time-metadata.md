---
layout: post
title: 修复 Valaxy 的时间元数据显示问题
tags:
  - valaxy
  - dev
  - javascript
  - yaml
categories: Valaxy 笔记
date: 2024-07-10 22:52:15
updated: 2024-07-10 22:52:15
---

我们 YAML 和 JavaScript 真是太厉害了。

<!-- more -->

## 问题

参见 [Valaxy#404](https://github.com/YunYouJun/valaxy/issues/404)。

在 repo 里翻翻找找发现了它溯源于 [`day.js`](https://day.js.org/) 迁移到 [`date-fns`](https://date-fns.org/) 的问题。

JS 的 `Date` 对象只有两种时区：本地时区和 UTC 时区。没有时区信息的 `Date` 自然会导致偏移问题。

## 初次尝试

`date-fns` 的姊妹库 `date-fns-tz` 提供了时区支持，但是在 Valaxy 中并没有使用。
那么只要我们用上 `date-fns-tz` 就可以解决问题了...?

但是 YAML 中，时间戳如果没有指定时区，默认会被解析为 UTC 时间。
于是要先把 `gray-matter` 的 `engine` 魔改了, 去除 `js-yaml` 的默认行为。
折腾完之后, `date-fns-tz` 就可以正常工作了...吗？

`date-fns-tz` 的解析函数 `fromZonedTime` 实际上实现并不正确, 而 `toDate` 的行为才是正确的 (但是这个函数根本不在文档里)。
换用这个 API 之后, 写了几个测试都过了, 于是[提交 PR 并成功合并](https://github.com/YunYouJun/valaxy/pull/409)。
看起来一切都很完美, 但是...?

## 出锅

形如 `2021-1-1 1:00:00` 的时间戳不能被 `toDate` 解析。
我起初以为是 YAML 规范的问题, 于是简单地加了个 polyfill 准备提交:

```ts
export function toDate(date: number | string | Date, options?: ToDateOptionsWithTZ) {
  if (typeof date === 'string') {
    //               YYYY       MM         DD            SEP          HH           MM       SS       FRAC                   ZONE
    const regex = /^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})([Tt]|[ \t]+)([0-9]{1,2})(:[0-9]{2}:[0-9]{2}(?:\.[0-9]*)?(?:[ \t]*Z|[-+][0-9]{1,2}(?::[0-9]{2})?)?)$/
    // we need to patch month, day and hour
    date = date.replace(regex, (_, y, m, d, sep, h, rest) => {
      const pad = (v: string) => v.padStart(2, '0')
      return `${y}-${pad(m)}-${pad(d)}${sep}${pad(h)}${rest}`
    })
  }
  return originalToDate(date, options)
}
```

正在这时, 我想起来形如 `2021/1/1` 这种根本不在规范里的时间戳本来正常显示, 这又是怎么回事?
顺着源码, 我一路找到了 `Date` 本身的构造函数, 于是我看到了...

## JavaScript 的一个洞

[`Date.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse) 的行为是不可预测的, 它会根据不同的实现返回不同的结果。
而且它接受的格式多种多样, 手动模拟根本不可能。

精神崩溃的我尝试直接提取 `date` 中是否包含时区信息, 再以此用位移修正时间戳。
但是这个想法并不靠谱 (`-dd` 也可能是日期中的有效部分), 同时时区信息和时间戳本体间可能根本没有分隔符,
使得简单地利用正则表达式或内置方法进行判断的想法落空。

虽然如此, `Date.parse` 可以正确地识别 `2021-1-1 1:00:00+08:00` 这种格式, 于是借助这个特性和默认情况下它会基于本机时间解析的特性, 我们便有了...

## 最后的方案

最后的方案其实很简单, 我们直接移除 `date-fns-tz` 的引入, 用 `new Date()` 代替 `js-yaml` 来解析时间戳。
这样就可以保证时间戳的正确性, 同时也不会有时区问题（时区直接从当前机器取，在开始构建前设置 `TZ` 环境变量就好了）。
