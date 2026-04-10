import ExtensibleTable from "./ExtensibleTable";

// 引入你所有的插件
import MarkdownPopoverCell from "./plugins/markdown-popover/";

// import AudioPlayerCell from "./plugins/audio-player";

// 建立本博客专属的全局插件注册表
const globalPlugins = {
	"markdown-popover": MarkdownPopoverCell,
	// "audio-player": AudioPlayerCell,
};

/**
 * 桥接组件：负责隔离 Astro 的序列化边界。
 * 这个组件将被挂载 client:load，因此在它内部传递 React 组件给下层是绝对安全的。
 */
export default function TableBridge({ columns, ...restProps }) {
	return (
		<ExtensibleTable columns={columns} plugins={globalPlugins} {...restProps} />
	);
}
