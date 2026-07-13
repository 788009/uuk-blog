import { visit } from "unist-util-visit";

export function remarkLinksNewTab() {
	return (tree) => {
		visit(tree, ["link", "linkReference"], (node) => {
			node.data ??= {};
			node.data.hProperties = {
				...node.data.hProperties,
				target: "_blank",
				rel: "noopener noreferrer",
			};
		});
	};
}
