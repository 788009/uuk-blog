---
title: 博客短链接
published: 2026-09-27
description: ''
image: ''
tags: ['Astro', 'Cloudflare Workers', '短链接', '折腾']
category: '技术'
draft: false 
lang: ''
---

自从开始维护自己的博客，博客链接就成为了我常见的分享形式之一，比如分享自己的歌单，就只需要发 `blog.uuk.moe/records/songs/`。但分享多了，总是觉得链接太长，因此想到可以用 `uuk.moe` 跳转，这是我当时花了几个小时精心挑选出来的三字域名，本身也很适合用于短链接；目前 `uuk.moe` 也仅仅用于展示一个跳转到博客的按钮，没有其他功能。

我设计的规则如下：
- `uuk.moe/songs` 和 `uuk.moe/records/songs` 都可以跳转到 `https://blog.uuk.moe/records/songs/`
- 若以后添加了 `https://blog.uuk.moe/posts/songs/`，则 `uuk.moe/songs` 会跳转到消歧义页
- `uuk.moe/friends` 会跳转到 `https://blog.uuk.moe/friends/`，若以后添加了 `https://blog.uuk.moe/posts/friends/`，则 `uuk.moe/friends` 依然会跳转到 `https://blog.uuk.moe/friends/`，因为路由更短

Astro 构建时会自动生成 Sitemap，我的 Sitemap 在 <https://blog.uuk.moe/sitemap-0.xml>，这可以直接作为映射的字典，而不需要我手动生成或维护。

最终的方案是 Cloudflare Workers，代码如下：

<details>
<summary>点击展开</summary>

```js title="_worker.js"
const SITEMAP_URL = "https://blog.uuk.moe/sitemap-0.xml";
const CACHE_TTL_SECONDS = 300;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 访问根路径返回静态首页 index.html
    if (pathname === "/" || pathname === "") {
      return env.ASSETS.fetch(request);
    }

    // 若直接访问已有的静态资源，直接交由静态资产服务处理
    if (pathname === "/index.html" || pathname === "/disambiguation.html") {
      return env.ASSETS.fetch(request);
    }

    const reqSegments = pathname.split("/").filter(Boolean);
    if (reqSegments.length === 0) {
      return env.ASSETS.fetch(request);
    }

    // 获取 Sitemap 目标列表
    const urls = await getSitemapUrls();

    // 筛选符合后缀匹配的路由
    const candidates = urls
      .map((targetUrl) => {
        const targetPath = new URL(targetUrl).pathname;
        const targetSegments = targetPath.split("/").filter(Boolean);
        return {
          fullUrl: targetUrl,
          targetSegments,
          depth: targetSegments.length,
        };
      })
      .filter((item) => isSuffixMatch(item.targetSegments, reqSegments));

    if (candidates.length === 0) {
      return new Response("404 Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 按路径深度升序排序（深度较小代表路径更短，优先匹配）
    candidates.sort((a, b) => a.depth - b.depth);

    const minDepth = candidates[0].depth;
    const minDepthCandidates = candidates.filter((item) => item.depth === minDepth);

    // 存在唯一最短路径时进行 302 跳转
    if (minDepthCandidates.length === 1) {
      return Response.redirect(minDepthCandidates[0].fullUrl, 302);
    }

    // 存在深度相等的多个候选路径时，读取消歧义 HTML 模板并替换内容
    const templateResponse = await env.ASSETS.fetch(
      new URL("/disambiguation.html", request.url)
    );
    const templateText = await templateResponse.text();

    const candidateItemsHtml = minDepthCandidates
      .map(
        (c) => `<li class="site-item"><a href="${c.fullUrl}">${c.fullUrl}</a></li>`
      )
      .join("\n");

    const htmlContent = templateText
      .replace("{{REQ_PATH}}", escapeHtml(pathname))
      .replace("{{CANDIDATE_LIST}}", candidateItemsHtml);

    return new Response(htmlContent, {
      status: 300,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
};

function isSuffixMatch(targetSegments, reqSegments) {
  if (targetSegments.length < reqSegments.length) return false;
  const offset = targetSegments.length - reqSegments.length;
  for (let i = 0; i < reqSegments.length; i++) {
    if (
      targetSegments[offset + i].toLowerCase() !==
      reqSegments[i].toLowerCase()
    ) {
      return false;
    }
  }
  return true;
}

async function getSitemapUrls() {
  const fetchResp = await fetch(SITEMAP_URL, {
    cf: {
      cacheTtl: CACHE_TTL_SECONDS,
      cacheEverything: true,
    },
  });

  if (!fetchResp.ok) {
    return [];
  }

  const text = await fetchResp.text();
  const locRegex = /<loc>(.*?)<\/loc>/gi;
  const urls = [];
  let match;
  while ((match = locRegex.exec(text)) !== null) {
    const u = match[1].trim();
    if (u) urls.push(u);
  }
  return urls;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

```html title="disambiguation.html"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>消歧义 - uuk</title>
    <style>
        :root {
            --bg-color: #ffffff;
            --text-color: #111111;
            --link-color: #555555;
            --link-hover-bg: #f0f0f0;
            --link-hover-color: #000000;
            --border-color: #e0e0e0;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --bg-color: #121212;
                --text-color: #e0e0e0;
                --link-color: #aaaaaa;
                --link-hover-bg: #222222;
                --link-hover-color: #ffffff;
                --border-color: #333333;
            }
        }

        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            box-sizing: border-box;
        }

        .container {
            width: 100%;
            max-width: 480px;
        }

        h1 {
            font-size: 1.8rem;
            font-weight: 600;
            margin: 0 0 1rem 0;
            letter-spacing: -0.03em;
        }

        p {
            color: var(--link-color);
            margin-bottom: 1.5rem;
            word-break: break-all;
        }

        code {
            background-color: var(--link-hover-bg);
            padding: 2px 6px;
            border-radius: 4px;
        }

        .site-list {
            list-style: none;
            padding: 0;
            margin: 0;
            width: 100%;
        }

        .site-item {
            margin-bottom: 0.75rem;
        }

        .site-item a {
            display: block;
            text-align: left;
            text-decoration: none;
            color: var(--link-color);
            font-size: 1rem;
            padding: 0.75rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            transition: all 0.2s ease;
            word-break: break-all;
        }

        .site-item a:hover {
            color: var(--link-hover-color);
            background-color: var(--link-hover-bg);
            border-color: var(--link-hover-color);
        }
    </style>
</head>
<body>

    <div class="container">
        <h1>路径消歧义</h1>
        <p>请求路径 <code>{{REQ_PATH}}</code> 匹配到多个相同优先级的目标：</p>

        <ul class="site-list">
            {{CANDIDATE_LIST}}
        </ul>
    </div>

</body>
</html>
```

`index.html` 略。

</details>

选择手动上传文件部署，但一开始并没有正常工作，最后发现是因为 `_worker.js` 被识别成了静态资源，因此没有运行，详见[这里](/records/troubleshooting/#workers-手动上传文件部署不工作)。

