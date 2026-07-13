import { visit } from "unist-util-visit";

export function remarkLinksNewTab({ site } = {}) {
	const siteUrl = site ? new URL(site) : undefined;

	return (tree) => {
		const definitions = new Map();

		visit(tree, "definition", (node) => {
			definitions.set(node.identifier, node.url);
		});

		visit(tree, ["link", "linkReference"], (node) => {
			const url = node.url ?? definitions.get(node.identifier);

			if (!url || isInternalLink(url, siteUrl)) {
				return;
			}

			node.data ??= {};
			node.data.hProperties = {
				...node.data.hProperties,
				target: "_blank",
				rel: "noopener noreferrer",
			};
		});
	};
}

function isInternalLink(url, siteUrl) {
	if (!siteUrl || !URL.canParse(url, siteUrl)) {
		return true;
	}

	return new URL(url, siteUrl).origin === siteUrl.origin;
}
