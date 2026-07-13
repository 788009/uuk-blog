import { visit } from "unist-util-visit";

const ABSOLUTE_URL_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

function isExternalUrl(url) {
	return ABSOLUTE_URL_PATTERN.test(url) || url.startsWith("//");
}

export function remarkLinksNewTab() {
	return (tree) => {
		const definitions = new Map();

		visit(tree, "definition", (node) => {
			definitions.set(node.identifier, node.url);
		});

		visit(tree, ["link", "linkReference"], (node) => {
			const url =
				node.type === "link" ? node.url : definitions.get(node.identifier);

			if (!url || !isExternalUrl(url)) return;

			node.data ??= {};
			node.data.hProperties = {
				...node.data.hProperties,
				target: "_blank",
				rel: "noopener noreferrer",
			};
		});
	};
}
