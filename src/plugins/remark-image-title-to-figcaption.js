/**
 * Remark plugin to convert Markdown images with titles into <figure> and <figcaption> elements.
 *
 * Design decision:
 * This logic is placed in the Remark phase rather than Rehype to differentiate between
 * standard Markdown syntax and raw HTML tags. Markdown images `![alt](url "title")`
 * are converted into `<figure>` with `<figcaption>`, while raw HTML `<img title="...">`
 * tags remain untouched to preserve native browser hover tooltips.
 */

import { visit } from "unist-util-visit";

export function remarkImageTitleToFigcaption() {
	return (tree) => {
		visit(tree, "image", (node, index, parent) => {
			if (!node.title || !parent) return;

			// Skip if parent is already a figure container
			if (parent.data?.hName === "figure") return;

			const figcaptionNode = {
				type: "blockquote",
				data: {
					hName: "figcaption",
				},
				children: [
					{
						type: "text",
						value: node.title,
					},
				],
			};

			// Convert paragraph container to figure if image is the only child
			if (parent.type === "paragraph" && parent.children.length === 1) {
				parent.type = "blockquote";
				parent.data = {
					hName: "figure",
				};
				parent.children = [node, figcaptionNode];
			} else if (typeof index === "number") {
				const figureNode = {
					type: "blockquote",
					data: {
						hName: "figure",
					},
					children: [node, figcaptionNode],
				};
				parent.children.splice(index, 1, figureNode);
			}
		});
	};
}
