import DOMPurify from "isomorphic-dompurify";
import MarkdownIt from "markdown-it";
import { useMemo } from "react";
// Note: Reference Popover two levels up
import { Popover, PopoverContent, PopoverTrigger } from "../../shared/Popover";

// ==========================================
// 1. Plugin's default native Tailwind theme
// ==========================================
export const defaultMarkdownTheme = {
	triggerBtn:
		"relative bg-transparent transition-all duration-200 font-medium text-blue-600 dark:text-blue-400 inline-flex items-center gap-1.5 box-decoration-clone hover:bg-blue-50 dark:hover:bg-blue-500/10 active:scale-95 px-1 py-0.5 rounded-md leading-none align-middle",
};

// ==========================================
// 2. Plugin core component
// ==========================================
const md = new MarkdownIt({ breaks: true });

export default function MarkdownPopoverCell({ info }) {
	const value = info.getValue();
	const meta = info.column.columnDef.meta || {};
	const { buttonText = "Details", icon } = meta;

	// Receive plugin-specific theme passed via meta; otherwise, use the default theme
	const theme = meta.theme || defaultMarkdownTheme;

	// Dynamically calculate alignment
	const visibleColumns = info.table.getVisibleLeafColumns();
	const isLastColumn =
		visibleColumns[visibleColumns.length - 1].id === info.column.id;
	const positionClass = isLastColumn
		? "top-full right-0 mt-2 origin-top-right z-[60]"
		: "top-full left-0 mt-2 origin-top-left z-[60]";

	// Sanitize rendered Markdown for security
	const htmlContent = useMemo(() => {
		if (!value) return "";
		const rawHtml = md.render(value);
		return DOMPurify.sanitize(rawHtml);
	}, [value]);

	// Handle icon rendering logic
	const renderIcon = () => {
		if (!icon) return null;

		// If icon is a React component or element, render it directly
		if (typeof icon !== "string") {
			return (
				<span className="flex-shrink-0 flex items-center justify-center">
					{icon}
				</span>
			);
		}

		// If icon is a string (e.g., SVG), sanitize and render it
		return (
			<span
				className="flex-shrink-0 flex items-center justify-center"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: icon is sanitized by isomorphic-dompurify
				dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(icon) }}
			/>
		);
	};

	if (!value) return <span className="opacity-50">-</span>;

	return (
		<Popover>
			<PopoverTrigger>
				<button type="button" className={theme.triggerBtn}>
					{renderIcon()}
					<span>{buttonText}</span>
				</button>
			</PopoverTrigger>

			<PopoverContent positionClass={positionClass}>
				<div className="min-w-[240px] max-w-[320px] p-4 text-sm max-h-[60vh] overflow-y-auto custom-scrollbar">
					<div
						className="prose prose-sm dark:prose-invert max-w-none [&>ul]:m-0 [&>ul]:pl-4 [&>ul>li]:my-1"
						// Use sanitized HTML
						// biome-ignore lint/security/noDangerouslySetInnerHtml: icon is sanitized by isomorphic-dompurify
						dangerouslySetInnerHTML={{ __html: htmlContent }}
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
}
