import { useState } from "react";

// 1. Import decoupled logic Hooks and Context
import TableContext from "../core/TableContext";
import { useInteractiveTable } from "../core/useInteractiveTable";
import { useTableData } from "../core/useTableData";
import { useTableFilters } from "../core/useTableFilters";
import { useTablePlugins } from "../core/useTablePlugins";

// 2. Import translations and basic interaction components
import { useTableTranslation } from "../i18n/translation.js";
import { PopoverThemeContext } from "../shared/Popover";
import { TableBody } from "./TableBody";
import { TableHeader } from "./TableHeader";
// 3. Import UI building blocks
import { TableToolbar } from "./TableToolbar";

// Default native Tailwind theme (preserved as is)
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
	headerBg: "bg-white dark:bg-gray-800",
	cellBg: "bg-white dark:bg-gray-800",
	popoverPanel:
		"bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700",
	popoverAnimation: "transition-all duration-200",
	popoverOpen: "opacity-100 scale-100",
	popoverClosed: "opacity-0 scale-95 pointer-events-none",
};

export default function TableRoot({
	data = [],
	columns: rawColumns,
	plugins = {}, // Receive plugins directly here, no need for an extra ExtensibleTable wrapper
	filterableColumns = [],
	enableColumnManagement = true,
	enableItemCount = true,
	maxHeight = null,
	stickyHeader = false,
	stickyFirstCol = false,
	theme = genericTheme,
	language = "auto",
}) {
	// Initialize internationalization
	const { t } = useTableTranslation(language);

	// Step 1: Handle the data layer
	const { tableData, isLoading, fetchError } = useTableData(data);

	// Step 2: Handle the plugin layer (hijacking column components)
	const enhancedColumns = useTablePlugins(rawColumns, plugins);

	// Step 3: Calculate complex filter configurations
	const { filterConfig, columnDataTypes, multiTypeFilter, getUniqueValues } =
		useTableFilters({
			tableData,
			columns: enhancedColumns,
			filterableColumns,
			t,
		});

	// Step 4: Initialize TanStack Table state engine
	const table = useInteractiveTable({
		tableData,
		columns: enhancedColumns,
		multiTypeFilter,
	});

	// Minor UI interaction states
	const [openFilterId, setOpenFilterId] = useState(null);

	const isStickyTopActive = stickyHeader && maxHeight;

	// Step 5: Bundle and distribute all states
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
		maxHeight,
		stickyHeader,
		stickyFirstCol,
	};

	return (
		<PopoverThemeContext.Provider value={theme}>
			<TableContext.Provider value={contextPayload}>
				<div className="w-full flex flex-col gap-2">
					{/* Top toolbar panel */}
					<TableToolbar />

					{/* Table body */}
					<div
						className={`w-full overflow-x-auto ${isStickyTopActive ? "overflow-y-auto" : ""} ${theme.scrollbar}`}
						style={isStickyTopActive ? { maxHeight: maxHeight } : {}}
					>
						<table className={`w-full relative ${theme.table}`}>
							<TableHeader />
							<TableBody />
						</table>
					</div>
				</div>
			</TableContext.Provider>
		</PopoverThemeContext.Provider>
	);
}
