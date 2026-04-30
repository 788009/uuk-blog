---
title: 疑难杂症
published: 2026-04-19
description: ' '
image: ''
tags: []
category: ''
draft: false 
lang: ''
---

> 记录琐碎的技术问题以及解决方案。

<details>
<summary>目录</summary>

- [编码与乱码](#编码与乱码)
    - [UTF-8 编码的 `.ps1` 脚本依然使用 ANSI 输出字符串](#utf-8-编码的-ps1-脚本依然使用-ansi-输出字符串)
- [VMware](#vmware)
    - [无法打开内核设备“\\.\\VMCIDev\\VMX”](#无法打开内核设备vmcidevvmx)

</details>

## 编码与乱码

### UTF-8 编码的 `.ps1` 脚本依然使用 ANSI 输出字符串

#### 环境

- 2026.4.30
- 系统环境为简体中文 Windows 11，未开启“Beta 版: 使用 Unicode UTF-8 提供全球语言支持”。
- 运行脚本的 PowerShell 版本为 `5.1.26100.6584`。

#### 问题描述

以下 `.ps1` 脚本使用 UTF-8 编码。

```powershell
git commit -m "消息"
```

运行后，在 VS Code 与 GitHub 的 Git 提交记录中均显示为 `娑堟伅`。

使用 Python 转换编码。

```python
'娑堟伅'.encode('gbk').decode('utf-8')
```

结果为 `消息`，因此可以确认在某一环节必然使用 GBK 解码过。

#### 解决方案

- 方案一：使用 PowerShell 7 运行脚本。
- 方案二：将 `.ps1` 脚本的存储编码改为 UTF-8 with BOM。

#### 问题原因

VS Code 与 GitHub 不可能都是 GBK 环境，因此可以确认 Git 存储的 commit message 就是 UTF-8 编码的 `娑堟伅`，问题出在信息进入 `git.exe` 之前。

原脚本使用 UTF-8 存储，因此磁盘上 `消息` 对应的原始字节为 `E6 B6 88 E6 81 AF`。

由于文件没有 BOM，PowerShell 5 默认使用 ANSI（在简体中文系统中为 GBK）解码读取，即 `娑堟伅`，再用 UTF-16 LE 编码为 `FF FE 11 5A 1F 58 05 4F` 并存储在内存里的 `String` 对象中。

执行 `git` 命令时，PowerShell 5 将 UTF-16 LE 编码的 `娑堟伅` 转换成 UTF-8 编码，字节序列变为 `E5 A8 91 E5 A0 9F E4 BC 85`，再传递给 `git.exe`，这就是 `git.exe` 存储在磁盘的字节序列，即 UTF-8 编码的 `娑堟伅`。

VS Code 和 GitHub 使用 UTF-8 读取，于是解码成 `娑堟伅` 并显示，此为乱码来源。

BOM 是代表编码的文件头，将脚本编码换成 UTF-8 with BOM 之后，PowerShell 5 通过 BOM 确认文件编码为 UTF-8，才会使用 UTF-8 读取，之后传递给 `git.exe` 也是用 UTF-8 传递，因此没有乱码。

而 PowerShell 7 默认用 UTF-8 读取，因此没有乱码。

## VMware

### 无法打开内核设备“\\.\VMCIDev\VMX”

#### 环境

- 2026.4.18
- Windows 11

#### 问题描述

![无法打开内核设备“\\.\VMCIDev\VMX”: 操作成功完成。是否在安装 VMware Workstation 后重新引导?模块“DevicePowerOn”启动失败。未能启动虚拟机。](images/vmware-vmci.webp)

#### 解决方案

- 打开虚拟机配置文件，Windows 默认位于 `~/Documents/Virtual Machines/{name}/{name}.vmx`，也可以在 `虚拟机` → `设置` → `选项` → `高级` 的最后一项找到。
- 将 `vmci0.present` 的值从 `"TRUE"` 修改为 `"FALSE"`。
- 重新启动虚拟机。

#### 问题原因

未知。
