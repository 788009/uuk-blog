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

起始版本：[`6d39b0d`](https://github.com/saicaca/fuwari/tree/6d39b0dec41282e7852e23e032998a5789abee28)

## 2026

### 3.17

- 增加 `/records/` 路由，用于长期更新的内容。
    - [`ec78273`](https://github.com/788009/uuk-blog/commit/ec78273853d7d0a4d03ca6848b425faf7ee4cb0b): /records/ 与 /records/{slug}/ 可达
    - [`dfe196c`](https://github.com/788009/uuk-blog/commit/dfe196c3cecffefbbd6531fdf27a7f67cf4430dd): 添加 records 相关 UI
    - [`b9bcec2`](https://github.com/788009/uuk-blog/commit/b9bcec23649116c8cccfbc8877f5c70d5501dd0a): 修改 /records/{slug}/ 页面细节
    - [`d5ddbd6`](https://github.com/788009/uuk-blog/commit/d5ddbd68aecf7be0111dc03ea017947c53c55544): 彻底实现 /records/*
    - [`b54a8a4`](https://github.com/788009/uuk-blog/commit/b54a8a40ada9d96531794ecd858c1d6beb6388a6): 删去 /records/{slug} 中 license 相关模块的导入

### 3.29

- 增加 busuanzi 统计。
    - [`42ce778`](https://github.com/788009/uuk-blog/commit/42ce778a9c35ab9f56391fa21b1a7fd93e4090fa): add busuanzi

### 4.19

- 将 `PAGE_WIDTH` 从 `75` 改为 `76`。
    - [`5d34c77`](https://github.com/788009/uuk-blog/commit/5d34c772a87705fe5b3b6145e0d9c74f24bc1ce5): 将 PAGE_WIDTH 从 75 改为 76

### 4.25

- 将目录移至侧边栏并修改样式和显示条件。
    - [`b390d91`](https://github.com/788009/uuk-blog/commit/b390d918502428a801f93859576fbbcd42844e02): 将目录移至侧边栏并修改样式和显示条件
    - [`4b90a4e`](https://github.com/788009/uuk-blog/commit/4b90a4e57e5f8b7bb3f6bb492902ef0580e086ee): 更新目录样式，清理多余注释

### 5.6

- 实现全局 Mermaid 支持。
    - [`ae52c65`](https://github.com/788009/uuk-blog/commit/ae52c6574630e698d14da12da0b9d3e9cabb8c70): 实现全局 Mermaid 支持
- 支持 GitHub 风格的 `IMPORTANT` 和 `CAUTION` admonition。
    - [`03c3d63`](https://github.com/788009/uuk-blog/commit/03c3d63a957790d56f766878e76f192340a47c5a): chore: bump remark-github-admonitions-to-directives from 1.0.5 to 2.1.0
    - [`32a7376`](https://github.com/788009/uuk-blog/commit/32a73767952b0a457f4133baa798bd4d768a565c): 支持 GitHub 风格的 IMPORTANT 和 CAUTION admonition

### 5.14

- 将 `getSortedPosts()` 和 `getSortedPostsList()` 与 `/posts/` 解耦，抽象成 `getSortedCollections()` 和 `getSortedCollectionsList()`。
    - [`be8f333`](https://github.com/788009/uuk-blog/commit/be8f33321fddb6dbf5ff7f883665187583bef81d): 将 getSortedPosts() 和 getSortedPostsList() 与 /posts/ 解耦，抽象成 getSortedCollections() 和 getSortedCollectionsList()

### 5.15

- 增加面包屑支持。
    - [`8d19e1a`](https://github.com/788009/uuk-blog/commit/8d19e1a59a4a410685ea3932f7f4b718278fd304): 为 /records/ 支持面包屑
- 将 `/posts/` 和 `/records/` 的文章页面抽象为 `ArticleLayout.astro`。
    - [`ce61362`](https://github.com/788009/uuk-blog/commit/ce613626c8d73bdaa5cb99fa894d9c4195a861e2): 封装 /posts/ 和 /records/ 的文章页面为 ArticleLayout.astro

### 6.27

- 将标签按照文章数量分组。
    - [`8172d75`](https://github.com/788009/uuk-blog/commit/8172d75a4791fce47571d13f9b159e12001d6695): 将标签按照文章数量分组
- 前端动态排序标签实现空间利用效率最大化。
    - [`e9b6bd5`](https://github.com/788009/uuk-blog/commit/e9b6bd57ae95e736ae734b942296291c15fcd95e): 前端动态排序标签实现空间利用效率最大化

### 7.13

- 将 Markdown 链接改成默认在新标签页打开，相对路径、根路径、页内锚点除外。
    - [`2c47329`](https://github.com/788009/uuk-blog/commit/2c47329f6e4db8b05a419bcf1daba0797d9cd692): 将所有 Markdown 链接改成默认在新标签页打开

### 8.21

- 支持通过 `<picture>` 在亮暗主题使用不同图片（开发模式无法正常显示）
    - [`6eed908`](https://github.com/788009/uuk-blog/commit/6eed9087172c89a56c25cd5138ac4221df68bacb): 支持通过 `<picture>` 在亮暗主题使用不同图片
