import { visit } from "unist-util-visit";

export function remarkFixHtmlImages() {
	return (tree) => {
		visit(tree, "html", (node, index, parent) => {
			if (!node.value) return;

			// 1. Process <picture> tags
			if (node.value.includes("<picture")) {
				const darkMatch = node.value.match(
					/media=["']\(prefers-color-scheme:\s*dark\)["'][\s\S]*?srcset=["']([^"']+)["']/i,
				);
				const lightMatch =
					node.value.match(
						/media=["']\(prefers-color-scheme:\s*light\)["'][\s\S]*?srcset=["']([^"']+)["']/i,
					) || node.value.match(/<img[\s\S]*?src=["']([^"']+)["']/i);
				const altMatch = node.value.match(/alt=["']([^"']*)["']/i);

				if (!darkMatch || !lightMatch) return;

				const darkSrc = darkMatch[1];
				const lightSrc = lightMatch[1];
				const altText = altMatch ? altMatch[1] : "";

				// Construct the image node converted to MDAST, and inject Tailwind class names via hProperties
				const lightImageNode = {
					type: "image",
					url: lightSrc,
					alt: altText,
					data: {
						hProperties: {
							class: "block dark:hidden",
						},
					},
				};

				const darkImageNode = {
					type: "image",
					url: darkSrc,
					alt: altText,
					data: {
						hProperties: {
							class: "hidden dark:block",
						},
					},
				};

				if (parent && typeof index === "number") {
					if (parent.type === "root") {
						parent.children.splice(index, 1, {
							type: "paragraph",
							children: [lightImageNode, darkImageNode],
						});
					} else {
						parent.children.splice(index, 1, lightImageNode, darkImageNode);
					}
					return [visit.SKIP, index + 1];
				}
			}

			// 2. Process standalone <img> tags
			if (node.value.includes("<img")) {
				const srcMatch = node.value.match(/src=["']([^"']+)["']/i);
				const altMatch = node.value.match(/alt=["']([^"']*)["']/i);

				if (!srcMatch) return;

				const src = srcMatch[1];
				const altText = altMatch ? altMatch[1] : "";

				const imageNode = {
					type: "image",
					url: src,
					alt: altText,
				};

				if (parent && typeof index === "number") {
					if (parent.type === "root") {
						parent.children.splice(index, 1, {
							type: "paragraph",
							children: [imageNode],
						});
					} else {
						parent.children.splice(index, 1, imageNode);
					}
					return [visit.SKIP, index + 1];
				}
			}
		});
	};
}
