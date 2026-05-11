import TableRoot from "./ui/TableRoot";

// 引入你的所有自定义单元格插件
import MarkdownPopoverCell from "./plugins/markdown-popover/index";

// 建立全局插件注册表
const globalPlugins = {
	"markdown-popover": MarkdownPopoverCell,
};

/**
 * 桥接组件：负责隔离 Astro 的序列化边界。
 * 挂载了 client 指令后，在这个文件内部传递 React 组件给下层是绝对安全的。
 */
export default function TableBridge(props) {
	// 将全局插件直接注入到新的 TableRoot 中
	return <TableRoot plugins={globalPlugins} {...props} />;
}
