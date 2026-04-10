export const fuwariTableTheme = {
	table: "my-generic-table",
	primaryText: "text-[var(--primary)]",

	// 原有的面板样式，可用于表格外框或其他用途（保留向下兼容）
	panel:
		"card-base float-panel shadow-2xl border border-black/5 dark:border-white/10",

	btnPlain: "btn-plain scale-animation active:scale-95",
	activeBg: "bg-black/5 dark:bg-white/10",
	hoverBg: "hover:bg-black/5 dark:hover:bg-white/10",
	scrollbar: "custom-scrollbar",
	input:
		"border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-[var(--primary)]",
	divider: "bg-black/10 dark:bg-white/10",
	dangerBtn: "text-red-500 hover:bg-red-500/10 dark:hover:bg-red-400/10",
	iconHover: "hover:bg-black/10 dark:hover:bg-white/20",

	// ====== Popover 相关主题 ======
	// 复用原本 panel 的样式作为弹出面板样式
	popoverPanel:
		"card-base float-panel shadow-2xl border border-black/5 dark:border-white/10",
	popoverAnimation: "transition-all duration-200",
	popoverOpen: "opacity-100 scale-100",
	popoverClosed: "opacity-0 scale-95 pointer-events-none",

	popoverTriggerFallback:
		"cursor-pointer focus:outline-none text-[var(--primary)] hover:underline",
};
