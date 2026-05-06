import { visit } from "unist-util-visit";
import { escapeHtml, serializeHastChildren } from "./utils.js";

export function remarkMermaidPlugin(options = {}) {
	return function transformer(tree, file) {
		let mermaidCount = 0;
		visit(tree, "code", (node, index, parent) => {
			if (node.lang === "mermaid") {
				mermaidCount++;
				const htmlNode = {
					type: "html",
					value: `<pre class="mermaid">${escapeHtml(node.value)}</pre>`,
				};
				if (parent && typeof index === "number") {
					parent.children[index] = htmlNode;
				}
				if (options.logger) {
					options.logger.info(
						`Remark transformed mermaid block #${mermaidCount} in ${file.path || "unknown file"}`,
					);
				}
			}
		});
	};
}

export function rehypeMermaidPlugin(options = {}) {
	return function transformer(tree, file) {
		let mermaidCount = 0;
		visit(tree, "element", (node, _index, _parent) => {
			if (
				node.tagName === "pre" &&
				node.children?.length === 1 &&
				node.children[0].tagName === "code"
			) {
				const codeNode = node.children[0];
				const className = codeNode.properties?.className;

				if (
					Array.isArray(className) &&
					className.includes("language-mermaid")
				) {
					mermaidCount++;
					const diagramContent = serializeHastChildren(codeNode.children || []);
					node.properties = { ...node.properties, className: ["mermaid"] };
					node.children = [{ type: "text", value: escapeHtml(diagramContent) }];

					if (options.logger) {
						options.logger.info(
							`Rehype transformed mermaid block #${mermaidCount} in ${file.path || "unknown file"}`,
						);
					}
				}
			}
		});
	};
}
