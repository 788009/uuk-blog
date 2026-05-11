import {
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

export function useInteractiveTable({ tableData, columns, multiTypeFilter }) {
	// Unified management of all table micro-states
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
		// Inject the multi-dimensional filter calculated in useTableFilters
		filterFns: {
			multiTypeFilter,
		},
		defaultColumn: {
			filterFn: "multiTypeFilter",
		},
	});

	return table;
}
