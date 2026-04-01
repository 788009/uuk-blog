// src/components/InteractiveTable.jsx

import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

export default function InteractiveTable({
	data,
	columns,
	filterableColumns = [],
}) {
	const [sorting, setSorting] = useState([]);
	const [columnFilters, setColumnFilters] = useState([]);
	const [openFilterId, setOpenFilterId] = useState(null);

	const table = useReactTable({
		data,
		columns,
		state: { sorting, columnFilters },
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		// 1. 新增自定义筛选逻辑
		filterFns: {
			multiSelectOr: (row, columnId, filterValue) => {
				// 如果没有选择任何过滤项，默认显示所有行
				if (!filterValue || filterValue.length === 0) return true;
				// 获取当前单元格的值
				const cellValue = row.getValue(columnId);
				// 判断当前单元格的值是否在选中的数组列表中（完美的“或”逻辑）
				return filterValue.includes(cellValue);
			},
		},
		defaultColumn: {
			// 2. 将 arrIncludes 替换为我们自定义的 multiSelectOr
			filterFn: "multiSelectOr",
		},
	});

	// 点击外部关闭筛选面板
	useEffect(() => {
		const handleClickOutside = () => setOpenFilterId(null);
		document.addEventListener("click", handleClickOutside);
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);

	const getUniqueValues = (columnId) => {
		const values = new Set(data.map((item) => item[columnId]));
		return Array.from(values).filter(Boolean).sort();
	};

	return (
		<div className="overflow-x-auto w-full" style={{ minHeight: "300px" }}>
			<table className="my-generic-table w-full">
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								const isFilterable = filterableColumns.includes(header.id);
								const currentFilterValue = header.column.getFilterValue() || [];
								const isOpen = openFilterId === header.id;
								const isSorted = header.column.getIsSorted();

								return (
									<th
										key={header.id}
										className="relative"
										style={{ width: header.getSize(), padding: "0.5rem" }}
									>
										<div className="flex items-center justify-between gap-2">
											{/* 排序按钮 - 保持优美的样式 */}
											<div
												className={`flex-1 flex transition items-center justify-between w-full btn-plain scale-animation rounded-lg min-h-9 px-3 py-1 font-medium active:scale-95 cursor-pointer select-none ${
													isSorted ? "bg-black/5 dark:bg-white/10" : ""
												}`}
												onClick={header.column.getToggleSortingHandler()}
											>
												<span className="truncate">
													{flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
												</span>
												{/* 排序指示图标 */}
												<span className="opacity-40 text-[1rem] ml-1 flex-shrink-0">
													{{
														asc: (
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="1.2em"
																height="1.2em"
																viewBox="0 0 24 24"
															>
																<path
																	fill="currentColor"
																	d="M11 20V7.825l-5.6 5.6L4 12l8-8l8 8l-1.4 1.425l-5.6-5.6V20z"
																/>
															</svg>
														),
														desc: (
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="1.2em"
																height="1.2em"
																viewBox="0 0 24 24"
															>
																<path
																	fill="currentColor"
																	d="M12 20l-8-8l1.4-1.425l5.6 5.6V4h2v12.175l5.6-5.6L20 12z"
																/>
															</svg>
														),
													}[isSorted] ?? (
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="1.2em"
															height="1.2em"
															viewBox="0 0 24 24"
														>
															<path
																fill="currentColor"
																d="M12 5.825L15.175 9H8.825zm0 12.35L8.825 15h6.35zM12 4L6 10h12zm0 16l6-6H6z"
															/>
														</svg>
													)}
												</span>
											</div>

											{/* 筛选区域 - 拦截冒泡 */}
											{isFilterable && (
												<div
													className="relative"
													onClick={(e) => e.stopPropagation()}
												>
													<button
														onClick={() =>
															setOpenFilterId(isOpen ? null : header.id)
														}
														className={`flex transition items-center justify-center btn-plain scale-animation rounded-lg w-9 h-9 font-medium active:scale-95 ${
															currentFilterValue.length > 0 || isOpen
																? "bg-black/5 dark:bg-white/10 text-[var(--primary)]"
																: "opacity-60"
														}`}
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="1.2em"
															height="1.2em"
															viewBox="0 0 24 24"
														>
															<path
																fill="currentColor"
																d="M10 18h4v-2h-4zM3 6v2h18V6zm3 7h12v-2H6z"
															/>
														</svg>
													</button>

													{/* 筛选下拉面板 - 原生相对定位与过渡动画 */}
													<div
														className={`absolute z-[50] top-full -right-2 pt-2 transition-all duration-200 origin-top-right ${
															isOpen
																? "opacity-100 scale-100"
																: "opacity-0 scale-95 pointer-events-none"
														}`}
													>
														<div className="card-base float-panel p-2 min-w-[180px] shadow-2xl border border-black/5 dark:border-white/10 font-normal">
															<div className="px-3 py-2 text-[0.75rem] font-bold opacity-50 uppercase tracking-wider">
																筛选: {header.column.columnDef.header}
															</div>
															<div className="max-h-[240px] overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
																{getUniqueValues(header.id).map((val) => (
																	<label
																		key={val}
																		className={`flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 cursor-pointer ${
																			currentFilterValue.includes(val)
																				? "bg-black/5 dark:bg-white/10 text-[var(--primary)]"
																				: ""
																		}`}
																	>
																		<input
																			type="checkbox"
																			className="rounded border-gray-300 dark:border-gray-600 bg-transparent text-[var(--primary)] focus:ring-0 focus:ring-offset-0 mr-3 cursor-pointer"
																			checked={currentFilterValue.includes(val)}
																			onChange={(e) => {
																				const checked = e.target.checked;
																				const nextValue = checked
																					? [...currentFilterValue, val]
																					: currentFilterValue.filter(
																							(v) => v !== val,
																						);
																				header.column.setFilterValue(
																					nextValue.length
																						? nextValue
																						: undefined,
																				);
																			}}
																		/>
																		<span className="text-sm truncate">
																			{val}
																		</span>
																	</label>
																))}
															</div>

															{currentFilterValue.length > 0 && (
																<>
																	<div className="h-[1px] w-full bg-black/10 dark:bg-white/10 my-1.5" />
																	<button
																		onClick={() =>
																			header.column.setFilterValue(undefined)
																		}
																		className="flex transition whitespace-nowrap items-center justify-center w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 text-red-500 hover:bg-red-500/10 dark:hover:bg-red-400/10"
																	>
																		清除筛选
																	</button>
																</>
															)}
														</div>
													</div>
												</div>
											)}
										</div>
									</th>
								);
							})}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="p-3">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
