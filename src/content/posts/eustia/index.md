---
title: 舒适地游玩《秽翼的尤斯蒂娅》
published: 2026-07-24
description: ''
image: ''
tags: ['Galgame', '折腾', '拆包', '秽翼的尤斯蒂娅', '字体']
category: '游戏'
draft: false 
lang: ''
---

<details>
<summary>目录</summary>

- [更换字体](#更换字体)
- [放大字体](#放大字体)
    - [方法一](#方法一)
    - [方法二](#方法二)
    - [对比](#对比)
- [同步存档](#同步存档)
- [整合汉化](#整合汉化)
- [彻底解决排版问题](#彻底解决排版问题)
    - [历史记录](#历史记录)
    - [换行](#换行)

</details>

我平时既会用电脑玩，也会用手机玩，用 Git 维护存档并通过 GitHub 同步，因此需要双端存档兼容，一般下载 PC 版，手机使用 [Winlator](https://github.com/brunodev85/winlator) 游玩。

奈何脏翅膀比较麻烦，找到的汉化硬盘版在手机的 Winlator 怎么也打不开，有进程无窗口，尝试了很多参数组合也没有成功。咨询群友后决定转向 PC + TY ([Tyranor](https://t.me/Tyranor/)) 版本。

初步对比两个版本：
- PC + TY 版的 UI 更先进
- 二者的汉化文本完全相同
- 汉化硬盘版的图片有翻译，PC + TY 版没有，比如开篇第一句话
    - 汉化硬盘版：![人生不如意事，十常居七八。](first-sentence-zh.webp)
    - PC + TY 版：![仕方のないことが多すぎる。](first-sentence-jp.webp)

虽然很想玩更精致的汉化，但也只能舍弃了。

## 更换字体

自带的两种字体又小又不好看。

![游戏内的“明朝”字体](original-font-mincho.webp)
![游戏内的“ゴシック”（Gothic）字体](original-font-gothic.webp)

群友提到如果字体太小可以自己拆包更换字体，于是使用 [GARbro](https://github.com/morkt/garbro) 尝试拆包，发现字体在 `root.pfs.000` 内，路径为 `image/font/`，有三个文件，分别是
- `sourcehansans-bold.otf`
- `sourcehansans-medium.otf`
- `v3.ttf`

`.otf` 不熟悉，但 `.ttf` 我比较熟悉，我在 Galgame 常用的字体是华文中宋，电脑内的华文中宋是 `STZHONGS.TTF`，也是 `.ttf` 格式，因此可以直接替换。

问题是应该如何替换，GARbro 并未提供封包功能。

这时我想起群友提到过 PC + TY 版本的引擎是 [Artemis](https://www.ies-net.com/)（特征为资源文件扩展名是 `.pfs`），于是搜索 `Artemis 引擎 封包`，搜到了很多文章，其中[这一篇文章](https://www.bilibili.com/opus/568495301662731170)提到，Artemis 引擎支持免封包读取，只要路径相同即可，且游戏目录下的文件则比封包内的文件优先级更高。

这样一来就非常容易了，将 `STZHONGS.TTF` 重命名成 `v3.ttf`，然后放置在游戏目录内的 `image/font/` 下（需要自行创建目录），重启游戏，果然成功，在游戏内对应“明朝”字体。

![替换成功的字体，但字号很小](small-font.webp)

## 放大字体

正如群友所言，这个字体太小，需要放大。

### 方法一

我马上想到让 AI 写代码放大字体。

<details>
<summary>代码</summary>

```python
import sys
from fontTools.ttLib import TTFont
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen

input_path = "input.ttf"
output_path = "output_scaled.ttf"
scale_factor = 1.25  # 放大比例 125%

print(f"正在加载字体文件: {input_path}")
font = TTFont(input_path)

glyph_order = font.getGlyphOrder()
total_glyphs = len(glyph_order)

glyph_set = font.getGlyphSet()
hmtx = font['hmtx']
glyf = font['glyf']

new_glyfs = {}

# 设置进度打印间隔：每完成 5% 的进度打印一次
print_interval = max(1, total_glyphs // 20)

print(f"开始处理字形，总计 {total_glyphs} 个...")

for idx, name in enumerate(glyph_order, start=1):
    # 1. 缩放字符宽度与左边距
    width, lsb = hmtx[name]
    hmtx[name] = (int(round(width * scale_factor)), int(round(lsb * scale_factor)))

    glyph = glyf[name]
    if glyph.numberOfContours == 0 and not glyph.isComposite():
        pass
    else:
        # 2. 绘制并缩放字形（自动展开复合字形）
        pen = TTGlyphPen(glyph_set)
        tpen = TransformPen(pen, (scale_factor, 0, 0, scale_factor, 0, 0))
        glyph_set[name].draw(tpen)
        new_glyfs[name] = pen.glyph()

    # 3. 按百分比间隔输出进度，避免频繁 I/O
    if idx % print_interval == 0 or idx == total_glyphs:
        percent = (idx / total_glyphs) * 100
        print(f"处理进度: {idx}/{total_glyphs} ({percent:.1f}%)")

print("正在更新字形表数据...")
for name, new_glyph in new_glyfs.items():
    glyf[name] = new_glyph

print(f"正在保存文件至: {output_path}")
font.save(output_path)
print("字体处理完成。")
```

</details>

用输出的字体替换，游戏内字体大小变得十分舒适。

![舒适的字号](large-font.webp)

### 方法二

后来我无意中又打开了刚才参考的文章，发现之前阅读进度的下一节就是 `#0x6 字体修改`，里面不仅提到了替换字体，还提到了更改字体大小，方法是把 `system` 文件夹拆出来，全局搜索字体名称，找到定义字体大小的常量，修改，再将相关文件放到相同目录。

我立刻开始尝试，`system` 文件夹位于 `root.pfs`。不过在拆出来的 `system` 全局搜索 `v3.ttf` 并未搜到与字体大小有关的内容，只有一个 `get_font_face()` 函数。

尝试搜索 `size`，有 131 个结果，发现前几个结果是下划线命名法，于是再搜索 `font_size`，终于在 `system/system/var.lua` 内发现了目标：

```lua
font_size = {
	MIN   = 8,
	SMALL = 16,
	NORM  = 25,
	LARGE = 36,
	HUGE  = 46,
}
```

方法一的代码是放大到原来的 1.25 倍，于是我将每个大小也如此修改并向下取整：

```lua
font_size = {
	MIN   = 10,
	SMALL = 20,
	NORM  = 31,
	LARGE = 45,
	HUGE  = 57,
}
```

将该文件放置在游戏目录下的 `system/system/var.lua`，再把 `v3.ttf` 替换成未放大的华文中宋，启动游戏，效果与方法一一模一样。

### 对比

理论上方法二是更优的，因为若游戏排版文字（比如换行和行间距）时使用 `font_size` 而忽略显示文字的实际大小，方法一可能会导致排版错乱，而方法二概率更小。

然而脏翅膀正好是个例外，虽然两种方法对于短文本的效果一模一样（如方法一的图），但对于长文本或多行文本，方法一的效果反而更好。

比如下面这句话
- 未处理
    ![三行文本，上下左右均未与其他元素重叠，字体较小，行间距较大](long-text-small.webp)
- 方法一
    ![三行文本，上下左右均未与其他元素重叠，字体大小适中，行间距适中，三行文本的总高度与未处理基本相同](long-text-method-1.webp)
- 方法二
    ![三行文本，上左右均未与其他元素重叠，最后一行与底部 UI 重叠，字体大小适中，行间距较大](long-text-method-2.webp)

首先是换行，三种情况文本换行的绝对位置相同，未处理的第一行有 35 个字，方法一和方法二的第一行都是 28 个字，可以看出，游戏内处理换行时使用的是单个文字的实际宽度，因此方法一不会造成换行问题。

其次是行间距。

| | `font_size` | 字体文件字体大小 | 实际字体大小 | 实际行间距 |
|-|-|-|-|-|
| 未处理 | 较小 | 较小 | 过小 | 过大 |
| 方法一 | 较小 | 较大 | 适中 | 适中 |
| 方法二 | 较大 | 较小 | 适中 | 过大 |

另外在 `system` 全局搜索 `gap`、`height`、`spacing` 并未找到行间距相关常量。

综上，可以认为行间距被硬编码在二进制文件中，与 `font_size` 无关，每行文本的纵坐标由这个数和 `font_size` 决定，但与字体文件的字体大小无关。

基于此结论，理论上方法一有可能导致相邻行的文字重叠，而方法二是最优的解法。然而，从实际效果来看，游戏硬编码的行间距过大（未处理的行间距约等于文字高度），且该行间距适配未处理的小字号，使得文字不会与其他 UI 重叠；换成更大的 `font_size` 后，每行的高度增大，行间距不变，导致三行文本的总高度过大，最后一行文本与底部 UI 重叠。

而方法一属于歪打正着，由于 `font_size` 没变，游戏认为每行高度也没变，因此每一行的纵坐标与未处理相同（三行文本的总高度与未处理基本相同，也印证了这一点），而硬编码的过大行间距使得相邻行的文字还不够重叠，反而更大的实际字体大小抵消了过大的行间距，使得实际行间距十分舒适。

## 同步存档

能玩之后，自然要考虑同步存档，依然使用 Git 和 GitHub，但这次有些特殊，因为 Tyranor 的存档目录是游戏根目录，而 PC 的存档目录是游戏根目录下的 `savedata/`，于是需要使用 `.gitignore` 排除无关文件，加上自己创建的 `image/` 和 `system/` 目录，总共只需要忽略 6 项，非常少。

手机推送，电脑拉取，成功同步，然而电脑推送，手机拉取后，Tyranor 无法进入游戏（闪退），猜测是由于 `system.dat` 指定了桌面模式，而 Tyranor 无法使用桌面模式，所以闪退。于是在 `.gitignore` 添加 `system.dat`，顺便加上可能造成类似问题的 `system.ini`。

再测试，双端成功相互同步。

<details>
<summary>可用的 <code>.gitignore</code></summary>

```
image/
movie/
system/
Eustia_test.exe
root.pfs
root.pfs.000
system.dat
system.ini
```

</details>

后来发现 Tyranor 实际可以在设置中改为桌面模式，此前猜想错误，目前原因未知，但忽略 `system.dat` 和 `system.ini` 确实可以解决问题。

## 整合汉化

我一开始下载到的汉化硬盘版应该是 2011 年的[《穢翼のユースティア 初回版》](https://vndb.org/r7224)，引擎是 BGI/Ethornell（可执行文件是 `BGI.exe`，资源文件扩展名是 `.arc`），为什么同一个游戏会有两套引擎的版本呢？调查发现，八月社在 2016 年发布了[《穢翼のユースティア～新装版～》](https://vndb.org/r49044)，支持 Windows 和 Android，引擎换成了 Artemis，这就是我手上的 PC + TY 版。

既然都出自官方之手，可以猜测为了方便，迁移引擎的时候大多数资源文件的文件名都不会有变化，再结合 Artemis 优秀的文件读取机制，我突然想到，有没有可能把汉化硬盘版汉化的图片搬到 PC + TY 版？

从游戏开头的几句图片文本入手，先在 PC + TY 版寻找，发现在 `root.pfs.000` 内，位于 `image/obj/dic`，12 句话分别是 `aiy00010_01.png` 到 `aiy00010_12.png`。再在汉化硬盘版寻找，果不其然，在 `data02800.arc` 内找到了图片 `aiy00010_01` 到 `aiy00010_12`，正是游戏开头汉化过的图片。

进一步对比，`root.pfs.000/image/obj/dic` 内有 608 个文件，`data02800.arc` 内有 593 个文件，大量文件的文件名相同，可以认为就是相同作用的文件夹，另外对比了两个版本开头图片的尺寸，发现一模一样，于是用 GARbro 把 `data02800.arc` 内的所有图片提取成 PNG，并放置在 PC + TY 版游戏目录的 `image/obj/dic` 下，启动 PC + TY 版，点击 START。

![人生不如意事，十常居七八。](first-sentence-zh.webp)

成功了。

## 彻底解决排版问题

### 历史记录

对比放大字体的两个方案之后，我选择了方法一，本来以为没事了，直到我在一处长文本打开历史记录：

![历史记录中，一句长文本分成了四行，从第三行开始与下一句话重叠](long-text-backlog.webp)

先换成未放大的华文中宋观察一下：

![历史记录中，一句长文本分成了三行，第三行底部与下一句话几乎贴在一起](long-text-backlog-small.webp)

可以发现历史记录的文字排版逻辑与对话框完全相同。

但小字体对对话框来说太小了，所以必须使用大字体，于是自然想到调整 `font_type`，另外发现历史记录文本的字号明显比对话框的文本大，说明不是同一种大小，那么就可以只修改历史记录文本使用的大小，而不影响对话框文本。

每次把一个类别的字号改成 60，观察游戏内情况，以确定对应关系。结论是，对话框使用的是 `NORM`，而历史记录，哪个都不是。

难道硬编码了？其实不然，我在 `system` 文件夹全局搜索 `backlog`，在 `system/msg.iet`（其实是 Lua）发现了一段代码：

<details>
<summary>点击展开</summary>

```lua
function msg_backlog_init()
	local fontface = get_font_face()
	for i=1, 1 + init.backlog_page do
		-- 本文
		e:tag{"chgmsg", id=("500.100."..i..".0"), layered="0"}
		e:tag{"font",
			face		= fontface,
			left		= "360",
			top			= "68",
			width		= "660",
			height		= "540",
			size		= "30",
			rubyface	= fontface,
			rubysize	= "10",
			rubykerning	= "-4",
			spacetop    = "-4",
			spacemiddle = "-4",
			spacebottom = "0",
			color       = "0xFFFFFF",
			shadowcolor = "0x000000",
			outlinecolor= "0x000000",
			align       = "left",
			style       = "outline,shadow",
			kerning     = "-1",
			hung        = "0",
			stack		= "0" }
		init_adv_indent() -- インデント
		e:tag{"/chgmsg"}

		-- アクティブ文字色
		e:tag{"chgmsg", id=("500.100."..i..".10"), layered="0"}
		e:tag{"font",
			face		= fontface,
			left		= "360",
			top			= "68",
			width		= "660",
			height		= "540",
			size		= "30",
			rubyface	= fontface,
			rubysize	= "10",
			rubykerning	= "-4",
			spacetop    = "-4",
			spacemiddle = "-4",
			spacebottom = "0",
			color       = (init.backlog_color),
			shadowcolor = "0x000000",
			outlinecolor= "0x000000",
			align       = "left",
			style       = "outline,shadow",
			kerning     = "-1",
			hung        = "0",
			stack		= "0" }
		init_adv_indent() -- インデント
		e:tag{"/chgmsg"}

		-- 名前
		e:tag{"chgmsg", id=("500.100."..i..".1"), layered="0"}
		e:tag{"font",
			face         = fontface,
			left         = "60",
			top          = "72",
			width        = "640",
			height       = "160",
			size         = "35",
			rubyface     = fontface,
			rubysize     = "0",
			spacetop     = "0",
			spacemiddle  = "0",
			spacebottom  = "-8",
			color        = "0xFFFFFF",
			shadowcolor = "0x000000",
			outlinecolor= "0x000000",
			align        = "left",
			style        = "outline",
			kerning      = "0",
			hung         = "1",
			stack        = "0" }
		e:tag{"/chgmsg"}
	end
end
```

</details>

`本文` 对应历史记录的文本，`アクティブ文字色` 对应鼠标悬停的文本，`名前` 对应人名，可以三类文本看到使用的字号都是 35，比 `var.lua` 的 `NORM  = 25` 要大一些，与观察契合。实际上实验发现这里的 `size` 确实控制着历史记录文本的字号。

于是把普通文本和悬停文本的字号都改成 30（分别位于 `msg.iet` 的第 262 和第 288 行），果然不重叠了：

![历史记录中，一句长文本分成了三行，未与其他元素重叠](long-text-backlog-size30.webp)

> 另外注意到 `msg.iet` 中的 `spacetop`、`spacemiddle` 和 `spacebottom`，我在 `system` 全局搜索发现不止出现在 `msg.iet`，有没有可能控制行间距？实验否定了这个猜想。

### 换行

回顾一下上文 `放大字体` → `方法一` 的效果图：

![虽然是个相当引人注目的美人，但她这个将亲切二字丢入无底深\n渊的性格，为自己扣\n了不少的分。](long-text-method-1.webp)

可以发现最后一个换行明显多余，当时我只当成是汉化组不小心多加了一个换行，然而继续游玩才发现这并非偶然，上文历史记录的长文本也可以看到明显多余的换行，这在常规对话框里也存在，比如上文历史记录的第一句：

![虽然为此也遇到过几次濒临死亡的危机，但在和吉克的彼此帮助\n下，我们总算排除了\n万难。](long-text-2.webp)

我猜测这个换行是使用原本字体时期望的换行位置，于是我在游戏内把字体换成“ゴシック”（Gothic），结果印证了我的想法：

![虽然是个相当引人注目的美人，但她这个将亲切二字丢入无底深渊的性格，为自己扣\n(解析失败占位字符)\n了不少的分。](long-text-gothic.webp)

![虽然为此也遇到过几次濒临死亡的危机，但在和吉克的彼此帮助下，我们总算排除了\n(解析失败占位字符)\n万难。](long-text-2-gothic.webp)

我在其他几处长文本也将字体换成 Gothic，发现都与上面两张图一样，在第 37 个字之后有一个换行符，无一例外。

也就是说，虽然文本绘制引擎支持自动换行，文本还是以 37 字为上限主动截断并添加换行符，意义不明，初回版也没有这个主动的换行符。

<details>
<summary>初回版效果</summary>

![虽然是个相当引人注目的美人，但她这个将亲切二字丢入无底深\n渊的性格，为自己扣了不少的分。](long-text-bgi.webp)

</details>

而使用大字号的华文中宋，就导致提前触发了一次自动换行，文本绘制引擎看到几个字之后的换行符，就再换了一次行，导致最终效果十分不美观。

修复这个问题必须直接修改台本文件，根据经验和直觉，找到了 `root.pfs/scenario/main/`，该目录下的 `aiy00010.asb` 到 `aiy81010.asb` 总共 404 个 `.asb` 文件大概率就是台本文件。

> [!NOTE]
>
> **太长不看**
>
> 使用 [msg-tool](https://github.com/lifegpc/msg-tool) 将 `.asb` 解析成 YAML：
>
> ```powershell
> .\msg_tool.exe export -t artemis-asb aiy00010.asb -T custom --custom-yaml true
> ```
>
> 同目录下输出的 `aiy00010.yaml` 就是解析后的台本文件，把 `\r\n` 全部删除。
> 
> 打包成 `.asb`：
>
> ```powershell
> .\msg_tool.exe create -t artemis-asb aiy00010.yaml --custom-yaml true
> ```
> 
> 同目录下输出的 `aiy00010.asb` 就是打包后的台本文件。
> 
> 对所有 `.asb` 这样操作，再放置在游戏目录下的 `scenario/main/` 即可。

GARbro 无法解析 `.asb`，于是搜索 `asb artemis engine`，搜到一个叫做 [artemis-engine-port-tools](https://github.com/ATSPwang618/artemis-engine-port-tools) 的项目，其中 [asb解密查看方法说明.zip](https://github.com/ATSPwang618/artemis-engine-port-tools/blob/main/asb%E8%A7%A3%E5%AF%86%E6%9F%A5%E7%9C%8B%E6%96%B9%E6%B3%95%E8%AF%B4%E6%98%8E.zip) 内有 `asbutil.exe`，使用以下命令即可解析 `.asb`：

```powershell
.\asbutil.exe aiy00010.asb > aiy00010.txt
```

查看内容，发现的确是台本，记录了每一句台词，以及画面信息，还发现长文本确实都在 37 字之后换到了下一行，证实了之前的想法，比如

```
[#0 print data="虽然是个相当引人注目的美人，但她这个将亲切二字丢入无底深渊的性格，为自己扣
了不少的分。"]
```

删除换行之后需要打包成 `.asb`，但 `asbutil.exe` 没有打包的功能，artemis-engine-port-tools 也没有收录相关工具，于是继续看刚才的搜索结果，找到了 Lib.rs 中的 [msg_tool_build](https://lib.rs/crates/msg_tool_build)，页面中提到 `Artemis Engine ASB file (.asb/.iet)`，顺藤摸瓜找到了 [GitHub 仓库](https://github.com/lifegpc/msg-tool)。

这个工具支持 Extract messages from script files、Import data into script files，以及 Create a new script file，其他功能都是操作归档，与台本无关。我先尝试使用第三个功能：

```powershell
.\msg-tool.exe create -t artemis-asb aiy00010.txt aiy00010.asb
```

结果报错 `Error creating file: expected value at line 1 column 1`。

README 中导入和创建的部分都只有一个标题和一行命令，没有任何解释，所以不知道创建功能需要什么，另外导入功能也不会用，导出功能只能导出 JSON 格式的台词，丢失了很多其他信息。

找不到其他工具，于是我点开了 Issues，发现已关闭的 Issues 竟然有一个叫做 `添加对 《穢翼のユースティア 〜新装版〜》 asb格式的支持`（[#11](https://github.com/lifegpc/msg-tool/issues/11)），作者的回复提到 `-T custom --custom-yaml true` 可以强行提取成 YAML，于是

```powershell
.\msg_tool.exe export -t artemis-asb aiy00010.asb -T custom --custom-yaml true
```

确实可以，且 YAML 包含台本的所有信息，之前的换行变成了显式的 `\r\n`，比如

```yaml
- name: print
  line_number: 0
  attributes:
    data: "虽然是个相当引人注目的美人，但她这个将亲切二字丢入无底深渊的性格，为自己扣\r\n了不少的分。"
```

删除所有 `\r\n` 后再尝试创建

```powershell
.\msg-tool.exe create -t artemis-asb aiy00010.yaml aiy00010.asb
```

结果报错 `Error creating file: invalid number at line 1 column 2`，依然失败。

试错发现需要在 create 也加上 `--custom-yaml true`，即

```powershell
.\msg-tool.exe create -t artemis-asb aiy00010.yaml aiy00010.asb --custom-yaml true
```

将输出的 `aiy00010.asb` 放置在游戏目录下的 `scenario/main/`，启动游戏，多余换行不复存在。

![长文本自然分成两行，没有多余的换行，也没有与其他元素重叠](long-text-final.webp)

![历史记录的长文本自然分成两行，没有多余的换行，也没有与其他元素重叠](long-text-backlog-final.webp)

最后，编写程序批量转换所有 `.asb`，放置在游戏目录下的 `scenario/main/`，`.gitignore` 增加 `scenario/`，便彻底解决。

> 试错时看到 Issue #11 的提出者最后说成功把旧版汉化移植到新版了，于是点进这个人的主页，意外发现有一个叫做 [asb_parser](https://github.com/kongbaiz/asb_parser) 的项目，标题是“ASB 解析/打包工具”，确实可以打包，但推进到每一个 `.asb` 结束时游戏都稳定崩溃，遂放弃。
