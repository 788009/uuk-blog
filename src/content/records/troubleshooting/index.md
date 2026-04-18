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

- [VMware](#vmware)
    - [无法打开内核设备“\\.\\VMCIDev\\VMX”](#无法打开内核设备vmcidevvmx)

</details>

## VMware

### 无法打开内核设备“\\.\VMCIDev\VMX”

#### 问题描述

![无法打开内核设备“\\.\VMCIDev\VMX”: 操作成功完成。是否在安装 VMware Workstation 后重新引导?模块“DevicePowerOn”启动失败。未能启动虚拟机。](images/vmware-vmci.webp)

#### 问题原因

未知。

#### 解决方案

- 打开虚拟机配置文件，Windows 默认位于 `~/Documents/Virtual Machines/{name}/{name}.vmx`，也可以在 `虚拟机` → `设置` → `选项` → `高级` 的最后一项找到。
- 将 `vmci0.present` 的值从 `"TRUE"` 修改为 `"FALSE"`。
- 重新启动虚拟机。
