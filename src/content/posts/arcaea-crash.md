---
title: Arcaea 改包闪退原因
published: 2026-05-26
description: ' '
image: ''
tags: ['Arcaea', '音游', '折腾', '拆包', '改包']
category: '游戏'
draft: false 
lang: ''
---

## 环境

- IPA
- 用 TrollStore 安装
- 壳版本：`4.x`

## 开屏闪退

1. 部分曲目所属曲包不存在。
    - `songlist` 中曲目的 `set` 字段未在 `packlist` 中定义。
2. 部分曲目必要字段缺失。
    - 如  
    ```json
    {
      "idx": 127,
      "id": "particlearts",
      "deleted": true
    }
    ```
3. 部分曲目有附加文件但文件不存在。
    - `songlist` 中曲目有 `additional_files` 字段，如
    ```json
    "additional_files": [
        {
            "file_name": "video.mp4",
            "requirement": "required"
        },
        {
            "file_name": "video_audio.ogg",
            "requirement": "required"
        }
    ]
    ```  
    但相关文件不存在。
4. 无法识别 Eternal 难度。
    - `songlist` 中曲目有 `ratingClass` 为 `4` 的难度，而 `4.x` 版本还没有这个难度。

## 开始界面进入主界面时闪退

1. （存疑）无 Final Verdict 曲包
    - `packlist` 中无 `finale` 曲包

## 进入选曲界面闪退

1. 无教程谱面。
    - 仅影响首次进入，重新启动即正常。
2. Arcaea 曲包无曲目。
    - `songlist` 中无 `set` 值为 `base` 的曲目。

## 选中特定难度后闪退

1. 曲包内存在曲目仅包含该难度。
    - `songlist` 中存在曲目的 `difficulties` 列表仅包含一项。
