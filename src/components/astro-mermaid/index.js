// src/index.js

import { getMermaidClientScript, getMermaidStyles } from "./client.js";
import { rehypeMermaidPlugin, remarkMermaidPlugin } from "./plugins.js";
import { validateConfig } from "./utils.js";

function parseIconPacks(iconPacks, logger) {
	return iconPacks
		.map((pack) => {
			if (!pack.name || typeof pack.name !== "string") {
				throw new Error('astro-mermaid: iconPack requires "name"');
			}
			if (typeof pack.url === "string") {
				return { name: pack.name, url: pack.url };
			}
			if (typeof pack.loader === "function") {
				const urlMatch = pack.loader
					.toString()
					.match(/fetch\s*\(\s*['"]([^'"]+)['"]\s*\)/);
				if (urlMatch) return { name: pack.name, url: urlMatch[1] };
				logger.warn(
					`astro-mermaid: Skipping iconPack "${pack.name}", loader cannot be serialized.`,
				);
				return null;
			}
			throw new Error(
				`astro-mermaid: iconPack "${pack.name}" requires a valid "url"`,
			);
		})
		.filter(Boolean);
}

export default function astroMermaid(options = {}) {
	const {
		theme = "default",
		autoTheme = true,
		mermaidConfig = {},
		iconPacks = [],
		enableLog = true,
		useElk = true,
	} = options;

	validateConfig(mermaidConfig);

	return {
		name: "astro-mermaid",
		hooks: {
			"astro:config:setup": async ({
				config,
				updateConfig,
				injectScript,
				logger,
			}) => {
				logger.info("Setting up Mermaid integration (Local Version)");

				const viteOptimizeDepsInclude = ["mermaid"];
				if (useElk) viteOptimizeDepsInclude.push("@mermaid-js/layout-elk");

				updateConfig({
					markdown: {
						remarkPlugins: [
							...(config.markdown?.remarkPlugins || []),
							[remarkMermaidPlugin, { logger }],
						],
						rehypePlugins: [
							...(config.markdown?.rehypePlugins || []),
							[rehypeMermaidPlugin, { logger }],
						],
					},
					vite: { optimizeDeps: { include: viteOptimizeDepsInclude } },
				});

				const iconPacksConfig = parseIconPacks(iconPacks, logger);

				// 注入抽离后的样式与脚本
				injectScript("page", getMermaidClientScript(options, iconPacksConfig));
				injectScript("page", getMermaidStyles());
			},
		},
	};
}
