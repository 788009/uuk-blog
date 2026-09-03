import { visit } from "unist-util-visit";

// Extract light and dark mode image nodes from <picture> tag
function parsePictureTag(htmlString) {
	const darkMatch = htmlString.match(
		/media=["']\(prefers-color-scheme:\s*dark\)["'][\s\S]*?srcset=["']([^"']+)["']/i,
	);
	const lightMatch =
		htmlString.match(
			/media=["']\(prefers-color-scheme:\s*light\)["'][\s\S]*?srcset=["']([^"']+)["']/i,
		) || htmlString.match(/<img[\s\S]*?src=["']([^"']+)["']/i);
	const altMatch = htmlString.match(/alt=["']([^"']*)["']/i);

	if (!darkMatch || !lightMatch) return null;

	const darkSrc = darkMatch[1];
	const lightSrc = lightMatch[1];
	const altText = altMatch ? altMatch[1] : "";

	return [
		{
			type: "image",
			url: lightSrc,
			alt: altText,
			data: {
				hProperties: {
					class: "block dark:hidden",
				},
			},
		},
		{
			type: "image",
			url: darkSrc,
			alt: altText,
			data: {
				hProperties: {
					class: "hidden dark:block",
				},
			},
		},
	];
}

// Extract standard image node from <img> tag
function parseImgTag(htmlString) {
	const srcMatch = htmlString.match(/src=["']([^"']+)["']/i);
	const altMatch = htmlString.match(/alt=["']([^"']*)["']/i);

	if (!srcMatch) return null;

	return [
		{
			type: "image",
			url: srcMatch[1],
			alt: altMatch ? altMatch[1] : "",
		},
	];
}

export function remarkFixHtmlImages() {
	return (tree) => {
		visit(tree, "html", (node, index, parent) => {
			if (!node.value || typeof index !== "number" || !parent) return;

			const html = node.value.trim();

			// 1. Handle <figure> wrappers
			if (html.includes("<figure")) {
				const figcaptionMatch = html.match(
					/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i,
				);
				const captionText = figcaptionMatch ? figcaptionMatch[1].trim() : "";

				let imageNodes = null;
				if (html.includes("<picture")) {
					imageNodes = parsePictureTag(html);
				} else if (html.includes("<img")) {
					imageNodes = parseImgTag(html);
				}

				if (!imageNodes) return;

				const figureChildren = [...imageNodes];

				// Attach figcaption node using standard block type with hName override
				if (captionText) {
					figureChildren.push({
						type: "blockquote",
						data: {
							hName: "figcaption",
						},
						children: [
							{
								type: "text",
								value: captionText,
							},
						],
					});
				}

				// Construct AST figure node using standard block type with hName override
				const figureNode = {
					type: "blockquote",
					data: {
						hName: "figure",
					},
					children: figureChildren,
				};

				parent.children.splice(index, 1, figureNode);
				return [visit.SKIP, index + 1];
			}

			// 2. Handle standalone <picture> tags
			if (html.includes("<picture")) {
				const imageNodes = parsePictureTag(html);
				if (!imageNodes) return;

				const replacementNode =
					parent.type === "root"
						? {
								type: "paragraph",
								children: imageNodes,
							}
						: imageNodes;

				if (Array.isArray(replacementNode)) {
					parent.children.splice(index, 1, ...replacementNode);
				} else {
					parent.children.splice(index, 1, replacementNode);
				}
				return [visit.SKIP, index + 1];
			}

			// 3. Handle standalone <img> tags
			if (html.includes("<img")) {
				const imageNodes = parseImgTag(html);
				if (!imageNodes) return;

				const replacementNode =
					parent.type === "root"
						? {
								type: "paragraph",
								children: imageNodes,
							}
						: imageNodes[0];

				parent.children.splice(index, 1, replacementNode);
				return [visit.SKIP, index + 1];
			}
		});
	};
}
