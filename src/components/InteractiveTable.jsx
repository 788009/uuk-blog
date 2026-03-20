// src/components/InteractiveTable.jsx

import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

export default function InteractiveTable({ data, columns }) {
	const [sorting, setSorting] = useState([]);

	const table = useReactTable({
		data,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<table className="my-generic-table">
			<thead>
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<th
								key={header.id}
								onClick={header.column.getToggleSortingHandler()}
								style={{
									cursor: "pointer",
									width: header.getSize(), // 获取 size 定义
								}}
							>
								{/* 渲染表头文字 */}
								{flexRender(
									header.column.columnDef.header,
									header.getContext(),
								)}
								{/* 渲染排序图标 */}
								{{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted()] ?? " ↕"}
							</th>
						))}
					</tr>
				))}
			</thead>
			<tbody>
				{table.getRowModel().rows.map((row) => (
					<tr key={row.id}>
						{row.getVisibleCells().map((cell) => (
							<td key={cell.id}>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}
