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
- [快捷指令（iOS / iPadOS）](#快捷指令ios--ipados)
    - [以结构化文本的形式获取指定文件夹下的所有文件](#以结构化文本的形式获取指定文件夹下的所有文件)
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

## 快捷指令（iOS / iPadOS）

### 以结构化文本的形式获取指定文件夹下的所有文件

1. 获取[文件夹]的内容
2. 从[文件夹内容]获取[名称]
    - 搜索 `详细信息` 获得
3. 使用[新行]合并[名称]

![图片](ipad-file-list-shortcut.webp)

## 其他

### 清空包含大量文件的文件夹

> [!NOTE]
>
> 仅限 Windows。

使用 `robocopy` 将空文件夹镜像到目标文件夹，实现目标文件夹的清空。

#### CMD

```batch
mkdir empty
robocopy empty <target> /MIR /MT:64 /NP /NJS /NJH /NC /NFL /NDL > nul
rmdir empty
```

#### PowerShell

```powershell
mkdir empty | Out-Null
robocopy empty <target> /MIR /MT:64 /NP /NJS /NJH /NC /NFL /NDL | Out-Null
rmdir empty
```

速度参考：SSD（WD PC SN560 SDDPNQE-1T00-1102）清空 42322 个文件、709 MB 的 node_modules 用时 28.6 秒。

> [!CAUTION]
>
> 清空后不可恢复，请谨慎使用。

### Galgame 字幕常用字体

- 华文中宋（STZhongsong）
