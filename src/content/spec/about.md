<style>
  h1, h2, h3, h4 {
    text-align: center;
  }
  .sub {
    text-align: center;
  }
</style>

# 关于

## 项目

### 对该博客的折腾

#### [对 Fuwari 的修改](/records/customfuwari/)

> [!NOTE]
> 
> 让我熟悉了现代前端开发技术栈，特别是 pnpm、TypeScript、Vite、Tailwind CSS、Astro，这直接影响了之后很多项目的技术栈选择。

#### 可交互表格

<p class="sub">暂未开源&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>

用于[歌单](/records/songs/)的表格。

> [!NOTE]
> 
> 该项目让我熟悉了 MDX、Astro 岛屿、TanStack Table 和 React，深深感到 Astro 这方面的设计十分优秀。

#### 可交互关系图

<p class="sub">暂未开源&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>

用于 [AP Macro 笔记](/records/notes/macro/#关系图)的关系图，基于 Mermaid，支持点击节点以查看节点之间的联系。

> [!NOTE]
> 
> 该项目让我熟悉了 Mermaid，对 MDX、Astro 岛屿和 React 的使用经验则是来源于可交互表格。

#### Galgame 时间轴

<p class="sub">暂未开源&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>

用于 [Galgame 记录](/records/galgame/)的时间轴。

> [!NOTE]
> 
> 依然是对 MDX、Astro 岛屿和 React 的运用。

### Termux Sandbox

::github{repo="788009/termux-sandbox"}

[QQ 共同群聊相关信息查询工具](#qq-共同群聊相关信息查询工具)主要设计为运行在 Termux，因此需要在 README 提及环境配置，这需要一个新的 Termux 环境来测试，发现这并不容易实现，因为 Termux 只允许用户 0 使用，且无法多开，故实现此项目。

> [!NOTE]
> 
> 该项目让我熟悉了 Proot、Chroot、`unshare` 等技术，以及图形驱动相关的不少名词，如 Mesa、Zink、Turnip、Vulkan 等等。

### 蹭饭图

::github{repo="788009/cft"}

> [!NOTE]
> 
> 该项目让我熟悉了 GeoJSON 和 SVG 的应用。

### 听力音频生成工具

::github{repo="788009/listening-studio"}

高中英语听力内容往往与英语课内容关系不大，此工具支持由文本生成听力音频、由主题生成文本和题目再生成音频、组卷（包括拼接题目和音频），此外还有账号系统，可接入学校 OIDC，教师可使用所有功能，学生仅可查看公开题目。

> [!NOTE]
> 
> 该项目让我熟悉了 TTS、OIDC、数据库，以及这是我目前工程量最大的项目。
>
> 这是我第一次使用 Agent 搭建项目，十分震撼

### 科目一刷题工具

<p class="sub">不公开&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>

驾校指定的刷题软件很难用且很多广告，体验极差，于是我将全部 1703 题爬下来，自己用 Vite + Vue + Tailwind CSS 写了一个纯前端应用，支持顺序刷题、随机刷题、选项乱序、错题本、收藏题目等等功能，精准满足我的需求。

> [!NOTE]
> 
> 该项目让我进一步精进了前端技术。

### 运行在 Termux 的手势识别

::github{repo="788009/gesture-recognition-in-termux"}

> [!NOTE]
> 
> 该项目让我熟悉了 Termux:X11、MediaPipe。

### StubSync

<p class="sub">暂未开源&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>

用于解决我的个性化需求：电脑剩余空间无法存储手机所有需要备份的文件，有一个大容量 HDD 但不方便常开，因此需要记录已备份的文件，防止重复备份。

[实现该工具的原因](/posts/unbrick/)

> [!NOTE]
> 
> 该项目让我熟悉了各种设计范式，如基类、事件驱动、生产者-消费者架构，让我对解耦和抽象有了更深刻的认知。

### QQ 共同群聊相关信息查询工具

::github{repo="788009/qq-group-member-insight"}

支持查询：
- 共同群聊数量 >= 2 的用户。
- 指定群聊成员还在哪些群聊。
- 指定的若干群聊有哪些共同成员。

> [!NOTE]
> 
> 该项目让我熟悉了 sqlcipher 和 QQ 的数据库加密。

### Python 常驻脚本管理工具

<p class="sub">暂未开源&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>

我的电脑常驻运行数个 `.pyw` 程序，遂写一个管理器进行统一管理，支持添加/删除程序、启动时自动启动所有程序、开启/关闭某一个程序、接管程序输出并显示。

现有程序包括：
- `F9` 静音/取消静音。
- `Alt` + `Z` 启动 Windows 截屏工具。
    - 本来用 PowerToys 映射快捷键的，但这样无法以管理员身份启动截屏工具，在管理员身份的终端无法截屏，遂改成 Python 脚本。
- 定时启动 StubSync 尝试备份手机指定目录的文件，只要电脑手机处于同一个局域网下且可以通信，就会自动备份。
- 监听截图存储目录 `~\Pictures\Screenshots`，有新图片就自动发送到指定 IP 指定端口，IP 是手机的 IP，运行在端口的服务是接收文件并存储至 `/sdcard/Download`，手机服务运行在 Termux。
- 实现了许多实用功能的 Flask 服务，另外启动本地的 OpenList 用于传输文件，另外该程序还用于手机与电脑互传文本。

> [!NOTE]
> 
> 该项目让我熟悉了 pywebview。

### Galgame 按照人物分类片段

根据台本与图片素材重建画面，再加上音频。

#### 星空列车与白的旅行

::github{repo="788009/hoshishiro"}

[Bilibili 合集](https://space.bilibili.com/476232350/lists/5105429)

#### Clover Day's

<p class="sub">暂未开源&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>

[Bilibili 合集](https://space.bilibili.com/476232350/lists/8276752)

> [!NOTE]
> 
> 这两个项目让我熟悉了 moviepy。

### markdown-list-shifter

::github{repo="788009/markdown-list-shifter"}

在 VS Code 编写 Markdown 时快速切换有序/无序列表。

> [!NOTE]
> 
> 该项目让我熟悉了 VS Code 插件的编写流程，以及 Markdown AST。

### exam-graph

::github{repo="788009/exam-graph"}

根据成绩表格批量生成所有学生的各科成绩波动折线图。

> [!NOTE]
> 
> 对 pywebview 的使用经验直接来源于 [Python 常驻脚本管理工具](#python-常驻脚本管理工具)。

### In Falsus 辅助游玩工具

::github{repo="788009/infalsus-head-tracker"}

[效果](https://www.bilibili.com/video/BV1z4cqzWEQW/)

> [!NOTE]
> 
> 该项目让我熟悉了 pydirectinput 和 OpenCV，对 MediaPipe 的使用经验则是来源于 [Termux 手势识别项目](#运行在-termux-的手势识别)。

::github{repo="788009/infalsus-rotate"}

[效果](https://www.bilibili.com/video/BV1khcnz1ENa/)

> [!NOTE]
> 
> 该项目让我熟悉了一加 13 的陀螺仪和加速度计的使用。

::github{repo="ZL114514/Breakin_Falsus_Android"}

> [!NOTE]
> 
> 该项目是我第一次在 GitHub 上以 Pull Request 之外的形式与他人合作维护仓库。

### imghash

<p class="sub">暂未开源&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>

基于 pHash 的图片查重工具，用于尽可能确保平时再网上下载的图片不重复。

实际上很多手机相册或空间清理工具都有类似功能，但都无法满足我的个性化需求，如仅维护特定文件夹内的图片。

> [!NOTE]
> 
> 该项目让我熟悉了 pHash。

### pfs-tool

::github{repo="788009/pfs-tool"}

[实现该工具的原因](/posts/eustia/#关于-pfs-tool)

> [!NOTE]
> 
> 该项目让我熟悉了现代 C++ 开发流程。
