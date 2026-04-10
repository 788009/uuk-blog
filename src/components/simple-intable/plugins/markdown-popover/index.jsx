import MarkdownIt from "markdown-it";
import { useMemo } from "react";
// 注意向上两级引用 Popover
import { Popover, PopoverContent, PopoverTrigger } from "../../Popover";

// ==========================================
// 1. 插件默认原生 Tailwind 主题
// ==========================================
export const defaultMarkdownTheme = {
	// 去除了下划线，保留基础交互，添加了轻微的 padding 和 rounded 让背景悬停更自然
	triggerBtn:
		"relative bg-transparent transition-all duration-200 font-medium text-blue-600 dark:text-blue-400 inline-flex items-center gap-1.5 box-decoration-clone hover:bg-blue-50 dark:hover:bg-blue-500/10 active:scale-95 px-1 py-0.5 rounded-md leading-none align-middle",
};

// ==========================================
// 2. 插件核心组件
// ==========================================
const md = new MarkdownIt({ breaks: true });

export default function MarkdownPopoverCell({ info }) {
	const value = info.getValue();
	const meta = info.column.columnDef.meta || {};
	const { buttonText = "查看详情", icon } = meta;

	// 接收外部通过 meta 传入的插件专属主题，否则使用默认主题
	const theme = meta.theme || defaultMarkdownTheme;

	// 动态计算对齐方式
	const visibleColumns = info.table.getVisibleLeafColumns();
	const isLastColumn =
		visibleColumns[visibleColumns.length - 1].id === info.column.id;
	const positionClass = isLastColumn
		? "top-full right-0 mt-2 origin-top-right z-[60]"
		: "top-full left-0 mt-2 origin-top-left z-[60]";

	const htmlContent = useMemo(() => {
		if (!value) return "";
		return md.render(value);
	}, [value]);

	if (!value) return <span className="opacity-50">-</span>;

	return (
		<Popover>
			<PopoverTrigger>
				{/* 使用主题注入的按钮样式 */}
				<button type="button" className={theme.triggerBtn}>
					{icon && (
						<span
							className="flex-shrink-0 flex items-center justify-center"
							dangerouslySetInnerHTML={{ __html: icon }}
						/>
					)}
					<span>{buttonText}</span>
				</button>
			</PopoverTrigger>

			<PopoverContent positionClass={positionClass}>
				<div className="min-w-[240px] max-w-[320px] p-4 text-sm max-h-[60vh] overflow-y-auto custom-scrollbar">
					<div
						className="prose prose-sm dark:prose-invert max-w-none [&>ul]:m-0 [&>ul]:pl-4 [&>ul>li]:my-1"
						dangerouslySetInnerHTML={{ __html: htmlContent }}
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
}
