import { useState } from "react";

// 1. 引入抽离的逻辑 Hooks 和 Context
import TableContext from "../core/TableContext";
import { useTableData } from "../core/useTableData";
import { useTableFilters } from "../core/useTableFilters";
import { useTablePlugins } from "../core/useTablePlugins";
import { useInteractiveTable } from "../core/useInteractiveTable";

// 2. 引入翻译和基础交互件
import { TableI18nKey, useTableTranslation } from "../i18n/translation.js";
import { PopoverThemeContext } from "../shared/Popover";

// 3. 引入 UI 积木
import { TableToolbar } from "./TableToolbar";
import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";

// 默认原生 Tailwind 主题 (保留原样)
export const genericTheme = {
	table: "",
	primaryText: "text-blue-500 dark:text-blue-400",
	panel:
		"bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700",
	btnPlain: "transition-all active:scale-95",
	activeBg: "bg-gray-100 dark:bg-gray-700",
	hoverBg: "hover:bg-gray-50 dark:hover:bg-gray-700/50",
	scrollbar:
		"[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600",
	input:
		"border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-blue-500 focus:border-blue-500",
	divider: "bg-gray-200 dark:bg-gray-700",
	dangerBtn: "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20",
	iconHover: "hover:bg-gray-200 dark:hover:bg-gray-600",
	popoverPanel:
		"bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700",
	popoverAnimation: "transition-all duration-200",
	popoverOpen: "opacity-100 scale-100",
	popoverClosed: "opacity-0 scale-95 pointer-events-none",
};

export default function TableRoot({
	data = [],
	columns: rawColumns,
	plugins = {}, // 直接在这里接收 plugins，不需要再包一层 ExtensibleTable
	filterableColumns = [],
	enableColumnManagement = true,
	enableItemCount = true,
	theme = genericTheme,
	language = "auto",
}) {
	// 初始化国际化
	const { t } = useTableTranslation(language);

	// 第一步：处理数据层
	const { tableData, isLoading, fetchError } = useTableData(data);

	// 第二步：处理插件层（劫持列组件）
	const enhancedColumns = useTablePlugins(rawColumns, plugins);

	// 第三步：计算复杂的过滤配置
	const { filterConfig, columnDataTypes, multiTypeFilter, getUniqueValues } =
		useTableFilters({
			tableData,
			columns: enhancedColumns,
			filterableColumns,
			t,
		});

	// 第四步：初始化 TanStack Table 状态引擎
	const table = useInteractiveTable({
		tableData,
		columns: enhancedColumns,
		multiTypeFilter,
	});

	// 一些微小的 UI 交互状态
	const [openFilterId, setOpenFilterId] = useState(null);

	// 第五步：打包并分发所有状态
	const contextPayload = {
		table,
		tableData,
		columns: enhancedColumns,
		isLoading,
		fetchError,
		theme,
		t,
		enableColumnManagement,
		enableItemCount,
		filterConfig,
		columnDataTypes,
		getUniqueValues,
		openFilterId,
		setOpenFilterId,
	};

	return (
		<PopoverThemeContext.Provider value={theme}>
			<TableContext.Provider value={contextPayload}>
				<div className="w-full flex flex-col gap-2">
					{/* 顶部工具面板 */}
					<TableToolbar />

					{/* 表格主体 */}
					<div className="overflow-x-auto w-full">
						<table className={`w-full ${theme.table}`}>
							<TableHeader />
							<TableBody />
						</table>
					</div>
				</div>
			</TableContext.Provider>
		</PopoverThemeContext.Provider>
	);
}
