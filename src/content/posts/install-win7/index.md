---
title: 在旧电脑安装 Windows 7
published: 2026-03-29
description: ''
image: 'images/boot-device-not-found.webp'
tags: ['折腾', 'Windows 7']
category: '技术'
draft: false 
lang: ''
---

家里的旧电脑又 Boot Device Not Found 了（上次是 2025.3.28），于是再次重装系统。之前尝试过 Windows 10，但实在太卡，还是换回了 Windows 7。

<details>
<summary>目录</summary>

- [设备基本信息](#设备基本信息)
    - [电脑](#电脑)
    - [打印机](#打印机)
- [安装系统](#安装系统)
- [安装内置设备驱动](#安装内置设备驱动)
- [激活 Windows](#激活-windows)
- [安装软件](#安装软件)
    - [Chrome](#chrome)
    - [7-Zip](#7-zip)
    - [希沃白板](#希沃白板)
    - [QQ](#qq)
    - [WinCDEmu](#wincdemu)
    - [Office](#office)
- [安装打印机驱动](#安装打印机驱动)
- [其他](#其他)

</details>

## 设备基本信息

### 电脑

![HP Pavilion TS Sleekbook 14, Intel Celeron CPU 877, 4 GB 内存, 512 GB 硬盘, BIOS 日期 2013.7.2](images/msinfo.webp)

已经快 13 年了。

### 打印机

HP Laser Jet Pro MFP M128fn

## 安装系统

使用装好 [WePE](https://www.wepe.com.cn/) 的 U 盘，进入 PE，格式化 C 盘，打开 WinNTSetup，载入 Windows 7 镜像（上次下载的 `cn_windows_7_home_premium_with_sp1_x64_dvd_u_676691.iso`，来源已不可考），`选择可引导驱动器位置`和`选择安装驱动器的位置`都选择 C 盘，压缩选项选择 `Wimboot:WIMCOPY`，启用 Windows 7 的本机 USB 引导，开始安装。

安装完成后重启，~~和上次一样，亮起初始化设置，完成~~很快就亮起了报错。

![The digital signature for this file couldn't be verified.](images/signature-not-verified.webp)

按照 AI 的回答，按 F10 进入 BIOS，开启 Legacy Support，再次尝试重启，进入了磁盘检查。

![磁盘检查](images/check-disk.webp)

检查后，亮起了如下界面：

![安装程序正在启动服务](images/apply-config.webp)

莫非要成功了？然而并没有，很快弹出了报错：

![Windows 安装程序无法将 Windows 配置为在此计算机的硬件上运行。](images/fail-run.webp)

点`确定`就会自动重启，然后回到这个界面，弹出一模一样的报错。

AI 说这通常是一个经典的“假死”报错，并让我按 `Shift` + `F10` 打开 CMD 窗口，于是真的打开了。

![CMD 窗口](images/cmd.webp)

输入 `regedit` 打开注册表编辑器，将 `HKEY_LOCAL_MACHINE\SYSTEM\Setup\Status\ChildCompletion` 下的 `setup.exe` 从 1 改为 3。

重启，还是一样的界面，于是 AI 又让我在 CMD 执行 `cd \Windows\System32\oobe` 接着 `msoobe.exe`，然后，让我觉得非常诡异地，亮起了经典的 Windows 7 风格的初始化设置界面。

![初始化设置界面](images/msoobe.webp)

这就成功了？还没有。设置完成后，初始化界面消失，又回到了 CMD 窗口和报错弹窗的界面，我执行的命令还留在 CMD 中。

![CMD 窗口和报错弹窗的界面](images/return.webp)

这时候我用 CMD 尝试访问其他盘的文件，发现所有文件都可以访问。

但就算可以访问所有文件，也看不到进入桌面的方法，看起来走投无路了，然而，更加令人匪夷所思的是，AI 让我直接执行 `explorer.exe`，然后，就真的进桌面了。

![正在设置个性化设置](images/pre-desktop.webp)

![成功进入桌面](images/desktop.webp)

至今我仍然记得桌面亮起的那一刻，我的哭笑不得，甚至报错弹窗还没有消失，但就是进入桌面了，好像前面的报错都是摆设一样。

但是还有新的问题，任务栏里没有 Explorer，桌面也只有一个回收站，于是我双击回收站，又弹出了新的报错`因为配置标识不正确...`

![因为配置标识不正确，系统无法打开服务器进程，请检查用户名和密码。](images/more-errors.webp)

AI 继续发力，让我在 CMD 用 `notepad.exe` 打开记事本，`文件` → `打开`，于是打开了文件管理器。

![用记事本打开了文件管理器](images/notepad.webp)

虽然成功进入桌面了，但这样也无法算是能用。我看`Windows 安装程序无法将 Windows 配置为在此计算机的硬件上运行。`的报错从很早开始就一直存在，现在没什么其他事可以做，于是点击了`确定`，在意料之内地，电脑立刻重启。

然而，在意料之外的是，重启之后，任务栏里多了一个 Explorer，回收站也可以正常打开。

![正在准备桌面...](images/prepare-desktop.webp)

![正常的 Explorer](images/explorer.webp)

至此，虽然发生了很多莫名其妙的现象，但确实成功进入桌面，并且行为正常了。

## 安装内置设备驱动

上次重装 Windows 7，花了不少时间安装驱动，而这次还是带病运行，因此可以预见地，这次也一定会缺少驱动。

果然，打开设备管理器，便看到了 6 个`其他设备`。

![PCI 简易通讯控制器、SM 总线控制器、通用串行总线(USB)控制器、网络控制器、未知设备、以太网控制器](images/devices.webp)

- Intel Chipset Device Software 9.3.0.1019
    - SM 总线控制器的驱动，设备 VEN (Vendor ID) 代码是 `VEN_8086`，属于 Intel 的原生芯片组组件。
    - [下载页面](https://drivers.softpedia.com/get/Other-DRIVERS-TOOLS/INTEL/Intel-Chipset-Device-Software-9301019.shtml)
    - [直链](https://us.softpedia-secure-download.com/dl/952518c8932518a3836c0c531a04a113/69c75962/300150251/drivers/mb/INF_allOS_9.3.0.1019.exe)
- HP Qualcomm Atheros AR9000 Series Wireless Driver 10.0.0.251 for Windows 7/Windows 8
    - 网络控制器（即无限网卡）的驱动，设备 VEN 代码是 `VEN_168C`，代表 Atheros (高通)
    - [下载页面](https://drivers.softpedia.com/get/NETWORK-CARD/Atheros/HP-Qualcomm-Atheros-AR9000-Series-Wireless-Driver-1000251-for-Windows-7-Windows-8.shtml)
    - [直链](https://us.softpedia-secure-download.com/dl/24c354680149ef52495c6e0358fe37b4/69c75987/300259538/drivers/network/sp62236.exe)
- 尚未找到能安装的 USB 驱动，因此没有安装，也导致 3 个 USB 接口只有 1 个能用。
- 以太网控制器由于需求不大，也未安装驱动。

## 激活 Windows

用 [MAS](https://massgrave.dev/) 离线脚本激活 Windows，方法选择 TSforge。
- [MAS 离线脚本直链](https://dev.azure.com/massgrave/Microsoft-Activation-Scripts/_apis/git/repositories/Microsoft-Activation-Scripts/items?path=/MAS/All-In-One-Version-KL/MAS_AIO.cmd&download=true)

## 安装软件

### Chrome

从[这里](https://www.google.com/intl/zh-CN_ALL/chrome/other-platforms/)下载适用于其他平台的 Chrome。
- [Windows 7 64-bit 版本直链](https://dl.google.com/tag/s/appguid%3D%7B8A69D345-D564-463C-AFF1-A69D9E530F96%7D%26iid%3D%7BF67C74C9-0643-1840-7153-102517203741%7D%26lang%3Dzh-CN%26browser%3D4%26usagestats%3D0%26appname%3DGoogle%2520Chrome%26needsadmin%3Dprefers%26ap%3D-arch_x64-statsdef_1%26installdataindex%3Dempty/update2/installers/win_7/ChromeSetup.exe)

### 7-Zip

从[官网](https://www.7-zip.org/)下载。
- [v26.00 直链](https://www.7-zip.org/a/7z2600-x64.exe)


### 希沃白板

从[官网](https://easinote.seewo.com/)下载，会询问是否安装 KB2533623 补丁。

安装补丁后重启，再次运行安装程序，卡在安装 KB2533623 补丁（0\%），此时再重启一次即可。

### QQ

从[官网](https://im.qq.com/)下载。

### WinCDEmu

从[官网](https://wincdemu.sysprogs.org/)下载。
- [v4.1 直链](https://github.com/sysprogs/WinCDEmu/releases/download/v4.1/WinCDEmu-4.1.exe)

### Office

从 MAS 的 [Office 下载页面](https://massgrave.dev/office_c2r_links#chinese-simplified-zh-cn)下载 Office 2016，因为该页面提到：
> On Windows 7 and 8.1, use the Office 2016 Offline file to install Office. Newer versions of Office are not supported on older operating systems.

- [HomeStudentRetail 离线镜像直链](https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/zh-cn/HomeStudentRetail.img)

用 WinCDEmu 挂载数据光盘后，运行 `Setup.exe` 安装。

安装完成后，用[之前](#激活-windows)下载的 MAS 离线脚本激活 Office，方法选择 Ohook。

## 安装打印机驱动

在 [Microsoft Update Catalog](https://www.catalog.update.microsoft.com/) 搜索 `HP LaserJet M128`，下载第一个驱动并解压。
- [直链](https://catalog.s.download.windowsupdate.com/d/msdownload/update/driver/drvs/2015/01/20599217_046797936fd0ef339847e4b7825a87ad6ba1d740.cab)

用 USB 连接打印机，打开`开始` → `设备和打印机` → `添加打印机` → `添加本地打印机`，端口选择 `USB001`，继续，点击`从磁盘安装`，选择解压出来的 `hcpm127128.inf`，安装。

## 其他

还安装了[这里](/posts/run-pywebview-and-vue3-on-win7/)提到的若干证书/补丁/运行时。