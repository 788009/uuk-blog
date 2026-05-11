// Import all your custom cell plugins
import MarkdownPopoverCell from "./plugins/markdown-popover/index";
import TableRoot from "./ui/TableRoot";

// Establish a global plugin registry
const globalPlugins = {
	"markdown-popover": MarkdownPopoverCell,
};

/**
 * Bridge component: Responsible for isolating Astro's serialization boundary.
 * Inside this file, passing React components to the lower layer is absolutely safe
 * once the client directive is attached.
 */
export default function TableBridge(props) {
	// Inject global plugins directly into TableRoot
	return <TableRoot plugins={globalPlugins} {...props} />;
}
