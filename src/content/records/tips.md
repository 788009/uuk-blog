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
- [其他](#其他)
    - [清空包含大量文件的文件夹](#清空包含大量文件的文件夹)
    - [Galgame 字幕常用字体](#galgame-字幕常用字体)

</details>

## 媒体处理

### MP4 转 GIF

将 `input.mp4` 转换成 15 帧、720P 的 `output.gif`

```bash
ffmpeg -i input.mp4 -vf "fps=15,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" output.gif
```

## 其他

### 清空包含大量文件的文件夹

> [!NOTE]
>
> 仅限 Windows。

使用 `robocopy` 将空文件夹镜像到目标文件夹，实现目标文件夹的清空。

```batch
robocopy <empty-dir> <target-dir> /MIR /MT:64 /NP /NJS /NJH /NC /NFL /NDL > nul
```

其中 `<empty-dir>` 是空文件夹路径，`<target-dir>` 是目标文件夹的路径。

> [!CAUTION]
>
> 清空后不可恢复，请谨慎使用。

### Galgame 字幕常用字体

- 华文中宋（STZhongsong）
