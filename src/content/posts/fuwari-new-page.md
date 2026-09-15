---
title: 如何在 Fuwari 添加一个页面
published: 2026-09-14
description: ''
image: ''
tags: ['Astro', 'Fuwari', 'TypeScript', '折腾']
category: '技术'
draft: false 
lang: ''
---

> 适用于原生 [Fuwari](https://github.com/saicaca/fuwari)（具体来说，适用于版本 [`6d39b0d`](https://github.com/saicaca/fuwari/tree/6d39b0dec41282e7852e23e032998a5789abee28)），不一定完全适用于 [Firefly](https://github.com/CuteLeaf/Firefly) 等二开版，但原理相同。

## 让路由可访问

根据 [Astro 文档](https://docs.astro.build/zh-cn/basics/astro-pages/)，Astro 使用基于文件的路由，`src/pages/` 目录中的每个支持的文件都会根据其文件路径成为网站上的一个端点，支持的文件类型如下：

- [`.astro`](https://docs.astro.build/zh-cn/basics/astro-pages/#astro-页面)
- [`.md`](https://docs.astro.build/zh-cn/basics/astro-pages/#markdownmdx-页面)
- `.mdx` (需要[安装 MDX 集成](https://docs.astro.build/zh-cn/guides/integrations-guide/mdx/#安装))
- [`.html`](https://docs.astro.build/zh-cn/basics/astro-pages/#html-页面)
- `.js`/`.ts` (as [endpoints](https://docs.astro.build/zh-cn/guides/endpoints/))

打开 `src/pages/` 目录，可以看到不少 `.astro` 文件，分别对应各个页面，其中最简单的是对应 `/about/` 的 `about.astro`，内容如下：

```astro
---

import { getEntry, render } from "astro:content";
import Markdown from "@components/misc/Markdown.astro";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import MainGridLayout from "../layouts/MainGridLayout.astro";

const aboutPost = await getEntry("spec", "about");

if (!aboutPost) {
	throw new Error("About page content not found");
}

const { Content } = await render(aboutPost);
---
<MainGridLayout title={i18n(I18nKey.about)} description={i18n(I18nKey.about)}>
    <div class="flex w-full rounded-[var(--radius-large)] overflow-hidden relative min-h-32">
        <div class="card-base z-10 px-9 py-6 relative w-full ">
            <Markdown class="mt-2">
                <Content />
            </Markdown>
        </div>
    </div>
</MainGridLayout>
```

逻辑就是从 `/src/content/spec/about.md` 获取内容，再填入 `MainGridLayout` 定义好的框架，这个框架包含了所有布局和样式，由于 Fuwari 解耦的设计，这里可以直接复用。

因此最简单的方案就是照猫画虎，比如要创建一个友链页面 `/friends/`，则可以在 `src/pages/` 下创建一个 `friends.astro`，然后将 `about.astro` 的内容全部粘贴，把 `getEntry("spec", "about")` 改成 `getEntry("spec", "friends")`，把 `About page content not found` 改成 `Friends page content not found`，要是看 `aboutPost` 变量名不顺眼，也可以改成 `friendsPost`。

最后在 `/src/content/spec/` 下创建 `friends.md`，编写内容。

至此，虽然还有不少瑕疵，但访问 `/friends/` 确实可以看到友链页面了。

## I18n

可以看到 `MainGridLayout` 标签的参数 `title={i18n(I18nKey.about)} description={i18n(I18nKey.about)}` 含有 `I18nKey.about`，要是不修改，页面标题和描述就依然会是相应语言的“关于”，因此必须修改。

Fuwari 的 I18n 的相关文件都在 `src/i18n/` 下。I18n 的实现逻辑是，`translation.ts` 定义外部接口；`i18nKey.ts` 定义 `I18nKey` 类型，包含外部使用的所有键；`languages/{language}.ts` 定义每个键对应的具体翻译。因此 `translation.ts` 不需要修改，需要修改的是 `i18nKey.ts` 和 `languages/` 下的各个语言的翻译。

依然以友链为例，首先在 `i18nKey.ts` 中添加键，Fuwari 使用字符串枚举，因此要在 `I18nKey` 中添加 `friends = "friends",`，然后在 `languages/` 下的各个语言的翻译中添加具体翻译，比如在 `languages/zh_CN.ts` 中的 `zh_CN` 中添加 `[Key.friends]: "友链",`。

> [!NOTE]
>
> **可能的优化方向**
>
> `friends = "friends",` 要写两遍 `friends`，属于冗余，可以考虑改成联合类型，这在 `src/types/config.ts` 中就有出现，比如 `SiteConfig` 中的
>
> ```ts
> lang:
> 		| "en"
> 		| "zh_CN"
> 		| "zh_TW"
> 		| "ja"
> 		| "ko"
> 		| "es"
> 		| "th"
> 		| "vi"
> 		| "tr"
> 		| "id";
> ```
>
> 调用时写成 `i18n("home")`。
> 
> 或者也可以根据默认语言文件自动推导，这样甚至不需要维护 `i18nKey.ts`，只需要把 `translation.ts` 中的 `Translation` 改成如下写法即可：
>
> ```ts
> import { en } from "./languages/en";
> 
> export type I18nKey = keyof typeof en;
> 
> export type Translation = Record<I18nKey, string>;
> ```

## 添加顶部导航栏按钮

目前只能通过直接输入路由来访问，因此还需要在顶部导航栏添加一个按钮用于跳转，Fuwari 的顶部导航栏按钮在 `src/constants/link-presets.ts` 中的 `LinkPresets` 定义，与其类型 `[key in LinkPreset]: NavBarLink` 相关的 `LinkPreset` 和 `NavbarLink` 均在 `src/types/config.ts` 中定义。

依然以友链为例，在 `src/types/config.ts` 的 `LinkPreset` 中添加一项 `Friends,`，然后在 `src/constants/link-presets.ts` 的 `LinkPresets` 中添加如下内容：

```ts
	[LinkPreset.Friends]: {
		name: i18n(I18nKey.friends),
		url: "/friends/",
	},
```

最后在 `src/config.ts` 的 `navBarConfig` 中添加 `LinkPreset.Friends,` 即可。

> [!NOTE]
>
> **可能的优化方向**
>
> `src/types/config.ts` 的 `LinkPreset` 也可以使用联合类型而不是数字枚举，比如将其改成
>
> ```ts
> export type LinkPreset = "home" | "about" | "archive" | "friends";
> ```
>
> 然后将 `src/constants/link-presets.ts` 的 `LinkPresets` 改成
>
> ```ts
> export const LinkPresets: Record<LinkPreset, NavBarLink> = {
>     home: { name: i18n(I18nKey.home), url: "/" },
>     about: { name: i18n(I18nKey.about), url: "/about/" },
>     archive: { name: i18n(I18nKey.archive), url: "/archive/" },
>     friends: { name: i18n(I18nKey.friends), url: "/friends/" },
> };
> ```
>
> 最后将 `src/config.ts` 的 `navBarConfig` 中的 `LinkPreset.Home,` 改成 `"home"` 即可，其他同理。

## 可能的优化方向

可以看出 `about.astro` 和 `friends.astro` 的逻辑完全相同，因此可以考虑抽象成一个模板，我暂未实现。

对于单 Markdown 页面，还可以考虑实现一个脚本，只需要 `pnpm new-page {pagename}` 然后设置 `I18n` 就可以自动完成上述修改，创建新页面，此功能依然未实现。

## 更复杂的页面

除了友链页面，我还添加了记录页面 `/records/`，用于记录长期更新的内容，需要与 `/posts/{slug}/` 相同的路由格式，还需要支持在 `src/content/records/` 下添加文件以新建文章，另外将 `/records/` 页面本身作为导航页，使用与 `/about/` 页面相同的方式，即一个 Markdown 文章，自行维护文章列表。

`/records/` 页面采用上述方式实现，而 `/records/{slug}/` 页面则完全参考自 `/posts/{slug}/` 页面，一开始是全局搜索 `post` 和 `posts`，对照着添加，可以参考 [`ec78273`](https://github.com/788009/uuk-blog/commit/ec78273853d7d0a4d03ca6848b425faf7ee4cb0b) 和 [`d5ddbd6`](https://github.com/788009/uuk-blog/commit/d5ddbd68aecf7be0111dc03ea017947c53c55544) 两次 commit。

后来，我觉得重复代码实在太多，于是将其抽象成模板，参考 [`be8f333`](https://github.com/788009/uuk-blog/commit/be8f33321fddb6dbf5ff7f883665187583bef81d)。
