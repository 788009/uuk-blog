---
title: 对 Fuwari 的修改
published: 2026-05-15
description: ' '
image: ''
tags: []
category: ''
draft: false 
lang: ''
---

## 2026

### 3.17

- 增加 `/records/` 路由，用于长期更新的内容。

### 3.29

- 增加 busuanzi 统计。

### 4.19

- 将 `PAGE_WIDTH` 从 `75` 改为 `76`。

### 4.25

- 将目录移至侧边栏并修改样式和显示条件。

### 5.6

- 实现全局 Mermaid 支持。
- 支持 GitHub 风格的 `IMPORTANT` 和 `CAUTION` admonition。

### 5.14

- 将 `getSortedPosts()` 和 `getSortedPostsList()` 与 `/posts/` 解耦，抽象成 `getSortedCollections()` 和 `getSortedCollectionsList()`。

### 5.15

- 增加面包屑支持。
- 将 `/posts/` 和 `/records/` 的文章页面抽象为 `ArticleLayout.astro`。

### 6.27

- 将标签按照文章数量分组。
- 前端动态排序标签实现空间利用效率最大化。
