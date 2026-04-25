---
title: 常用技巧
published: 2026-04-25
description: ' '
image: ''
tags: []
category: ''
draft: false 
lang: ''
---

<details>
<summary>目录</summary>

- [媒体处理](#媒体处理)
    - [MP4 转 GIF](#mp4-转-gif)

</details>

## 媒体处理

### MP4 转 GIF

将 `input.mp4` 转换成 15 帧、720P 的 `output.gif`

```bash
ffmpeg -i input.mp4 -vf "fps=15,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" output.gif
```
