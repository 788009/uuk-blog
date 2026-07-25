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

</details>

我平时既会用电脑玩，也会用手机玩，用 Git 维护存档并通过 GitHub 同步，因此需要双端存档兼容，一般下载 PC 版，手机使用 Winlator 游玩。

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
