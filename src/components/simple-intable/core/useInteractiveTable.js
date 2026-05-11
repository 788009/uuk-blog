import { useState } from "react";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

export function useInteractiveTable({ tableData, columns, multiTypeFilter }) {
	// 统一管理所有的表格微状态
	const [sorting, setSorting] = useState([]);
	const [columnFilters, setColumnFilters] = useState([]);
	const [columnVisibility, setColumnVisibility] = useState({});
	const [columnOrder, setColumnOrder] = useState([]);

	const table = useReactTable({
		data: tableData,
		columns,
		state: { sorting, columnFilters, columnVisibility, columnOrder },
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onColumnOrderChange: setColumnOrder,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		// 注入我们在 useTableFilters 中算好的多维过滤器
		filterFns: {
			multiTypeFilter,
		},
		defaultColumn: {
			filterFn: "multiTypeFilter",
		},
	});

	return table;
}
