---
title: 在 Windows 7 运行 pywebview 和 Vue3
published: 2026-03-20
description: ''
image: ''
tags: ['Windows 7', '环境配置', 'Python', 'Vue', '折腾']
category: '技术'
draft: false 
lang: ''
---

起因是年段让我写一个批量成绩可视化的工具，考虑了无数的潜在错误、可配置项和防呆机制，结果还是被段长的 Windows 7 挡在了门外，于是开始研究如何兼容 Windows 7。

## 关于工具

::github{repo="788009/exam-graph"}

- requirements.txt
```
py7zr
tomli
tomli_w
pandas
openpyxl
seaborn
pywebview
```
- 使用 Nuitka 打包
```shell
nuitka --onefile --windows-console-mode=disable --enable-plugin=no-qt --include-module=openpyxl --include-data-dir=./web=web --include-data-file=./config.toml=config.toml --include-data-file=./config_schema.json=config_schema.json main.py
```

## 解决方案

### 使用 Python 3.8.10

Python 3.8.10 是最后支持 Windows 7 的版本。

### 安装根证书

安装 .NET Framework 4.8 需要根证书。

以下 3 个证书均导出自我的 win11。

- DigiCert Trusted Root G4
    - DigiCert_G4.cer
- Microsoft Root Certificate Authority 2010
    - msrootcert2010.cer
- Microsoft Root Certificate Authority 2011
    - msrootcert2011.cer

### 安装更新/补丁

- KB2533623
    - [Windows6.1-KB2533623-x64.msu](https://legacyupdate.net/download-center/download/26764/update-for-windows-7-x64-kb2533623)
    - 为 Windows 7 引入 `AddDllDirectory` 等现代 DLL 加载安全函数，解决 Python 3.8 核心动态库的 API 缺失问题。
- KB2999226 (Universal C Runtime, UCRT)
    - [Windows6.1-KB2999226-x64.msu](https://www.microsoft.com/zh-cn/download/details.aspx?id=49093)
    - 通用 C 运行时，现代 Python 的标准库是基于 UCRT 编译的。
- KB4474419 (SHA-2)
    - [windows6.1-kb4474419-v3-x64.msu](https://www.catalog.update.microsoft.com/Search.aspx?q=KB4474419)
    - WebView2 安装程序使用 SHA-2 签名；解决 WebView2 安装程序无法启动的问题。

### 安装 .NET

- .NET Framework 4.8
    - [NDP48-x86-x64-AllOS-ENU.exe](https://dotnet.microsoft.com/zh-cn/download/dotnet-framework/net48)（运行时，脱机安装程序）
    - pywebview 在 Windows 上是基于 .NET 的 WinForms 或 WPF 窗口控件封装的；Vue3 的桥接逻辑也需要高版本的 .NET 运行时来支撑。
- VC++ Redistributable 2015
    - [vc_redist.x64.exe](https://www.microsoft.com/zh-cn/download/details.aspx?id=48145)[^1]
    - 提供 C++ 运行时的基础 DLL 支撑。

### 安装 Edge WebView2

- WebView2 Runtime
    - [MicrosoftEdgeWebView2RuntimeInstallerX64.exe](https://archive.org/details/microsoft-edge-web-view-2-runtime-installer-v109.0.1518.78)[^2]
    - Windows 7 自带的 IE11 完全不支持 ES6 语法（let/const/箭头函数/Proxy）。WebView2 提供了 Chromium 内核，才能正常渲染现代网页，包括 Vue3。
    - WebView2 v109 是最后支持 Windows 7 的版本。

## 自动化

将上述所有依赖重命名为上述对应文件名后，全部移动至 `./dependencies/`，然后在当前目录新建 `setup.bat`，写入以下内容，使用 ANSI、CRLF 保存，右键以管理员身份运行，最后重启电脑。

```batch
@echo off
title Windows 7 Env Fixer

:: 1. Admin Check
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Please Run as Administrator!
    pause
    exit
)

set DEP_DIR=%~dp0dependencies
echo Folder: %DEP_DIR%
echo ----------------------------------------------------

:: --- 1. Certs ---
echo [1/4] Installing Certs...
certutil -addstore -f root "%DEP_DIR%\DigiCert_G4.cer" >nul 2>&1
certutil -addstore -f root "%DEP_DIR%\msrootcert2010.cer" >nul 2>&1
certutil -addstore -f root "%DEP_DIR%\msrootcert2011.cer" >nul 2>&1
echo [OK] Done.

:: --- 2. MSU Updates ---
echo [2/4] Checking KB Updates...
wmic qfe get hotfixid | find "KB2533623" >nul
if %errorLevel% neq 0 start /wait wusa.exe "%DEP_DIR%\Windows6.1-KB2533623-x64.msu" /quiet /norestart

wmic qfe get hotfixid | find "KB2999226" >nul
if %errorLevel% neq 0 start /wait wusa.exe "%DEP_DIR%\Windows6.1-KB2999226-x64.msu" /quiet /norestart

wmic qfe get hotfixid | find "KB4474419" >nul
if %errorLevel% neq 0 start /wait wusa.exe "%DEP_DIR%\windows6.1-kb4474419-v3-x64.msu" /quiet /norestart

:: --- 3. .NET 4.8 and VC ---
echo [3/4] Checking .NET and VC...

:: .NET 4.8
reg query "HKLM\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full" /v Release 2>nul | find "528040" >nul
if %errorLevel% neq 0 (
    echo Installing DOTNET 4.8
    start /wait "" "%DEP_DIR%\NDP48-x86-x64-AllOS-ENU.exe" /q /norestart
)

:: VC
reg query "HKLM\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" >nul 2>nul
if %errorLevel% neq 0 (
    echo Installing VC Redist
    start /wait "" "%DEP_DIR%\vc_redist.x64.exe" /quiet /norestart
)

:: --- 4. WebView2 ---
echo [4/4] Checking WebView2...
reg query "HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-D310-47F5-85B0-4A633F0F4E6D}" >nul 2>nul
if %errorLevel% neq 0 (
    echo Installing WebView2
    start /wait "" "%DEP_DIR%\MicrosoftEdgeWebView2RuntimeInstallerX64.exe" /silent /install
)

echo ----------------------------------------------------
echo ALL DONE. PLEASE RESTART.
pause
```

[^1]: [Solution for Windows 7 vc_redist.x64 not installing/repairing/errors](https://fr.pathofexile.com/forum/view-thread/1595468)

[^2]: [Latest version of Microsoft Edge-WebView2 Runtime 109.0.1518.140 compatible with Windows 7](https://learn.microsoft.com/en-us/answers/questions/1661814/latest-version-of-microsoft-edge-webview2-runtime)