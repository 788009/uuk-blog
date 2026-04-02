// src/components/InteractiveTable.jsx

import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

// ==========================================
// 默认原生 Tailwind 主题：纯净、无任何外部依赖
// ==========================================
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
};

export default function InteractiveTable({
	data,
	columns,
	filterableColumns = [],
	enableColumnManagement = true,
	enableItemCount = true,
	theme = genericTheme, // 现在默认应用通用原生主题
}) {
	const [sorting, setSorting] = useState([]);
	const [columnFilters, setColumnFilters] = useState([]);
	const [openFilterId, setOpenFilterId] = useState(null);

	const [columnVisibility, setColumnVisibility] = useState({});
	const [columnOrder, setColumnOrder] = useState([]);
	const [openManager, setOpenManager] = useState(false);
	const [showItemCount, setShowItemCount] = useState(enableItemCount);

	const filterConfig = useMemo(() => {
		const config = {};
		for (const item of filterableColumns) {
			if (typeof item === "string") {
				config[item] = { type: ["category"] };
			} else if (Array.isArray(item)) {
				const colId = item[0];
				const options = item[1];
				if (typeof options === "string") {
					config[colId] = { split: options, type: ["category"] };
				} else if (typeof options === "object") {
					let types = options.type || ["category"];
					if (!Array.isArray(types)) types = [types];
					config[colId] = { split: options.split, type: types };
				}
			}
		}
		return config;
	}, [filterableColumns]);

	const columnDataTypes = useMemo(() => {
		const types = {};
		columns.forEach((col) => {
			const id = col.accessorKey || col.id;
			const firstValid = data.find((row) => row[id] != null && row[id] !== "");
			types[id] = firstValid ? typeof firstValid[id] : "string";
		});
		return types;
	}, [columns, data]);

	const table = useReactTable({
		data,
		columns,
		state: { sorting, columnFilters, columnVisibility, columnOrder },
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onColumnOrderChange: setColumnOrder,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		filterFns: {
			multiTypeFilter: (row, columnId, filterValue) => {
				if (!filterValue) return true;

				const { categories, range } = filterValue;
				const hasCatFilter = categories && categories.length > 0;
				const hasRangeFilter = range && (range[0] !== "" || range[1] !== "");

				if (!hasCatFilter && !hasRangeFilter) return true;

				const cellValue = row.getValue(columnId);
				const config = filterConfig[columnId];
				const delimiter = config?.split;
				const colType = columnDataTypes[columnId];

				const checkPart = (part) => {
					let catMatch = true;
					let rangeMatch = true;
					const isEmpty = part == null || part === "";

					if (hasCatFilter) {
						if (isEmpty) {
							catMatch = categories.includes("无数据");
						} else {
							catMatch = categories.includes(part);
						}
					}

					if (hasRangeFilter) {
						if (isEmpty) {
							rangeMatch = false;
						} else {
							let p = part;
							let min = range[0];
							let max = range[1];

							if (colType === "number") {
								if (typeof p !== "number") p = Number(p);
								if (min !== "") min = Number(min);
								if (max !== "") max = Number(max);
							}

							if (min !== "" && p < min) rangeMatch = false;
							if (max !== "" && p > max) rangeMatch = false;
						}
					}

					return catMatch && rangeMatch;
				};

				const isCellEmpty = cellValue == null || cellValue === "";

				if (isCellEmpty) {
					return checkPart(cellValue);
				}

				if (delimiter && typeof cellValue === "string") {
					const parts = cellValue.split(delimiter);
					return parts.some(checkPart);
				}

				return checkPart(cellValue);
			},
		},
		defaultColumn: {
			filterFn: "multiTypeFilter",
		},
	});

	useEffect(() => {
		const handleClickOutside = () => {
			setOpenFilterId(null);
			setOpenManager(false);
		};
		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, []);

	const getUniqueValues = (columnId) => {
		const delimiter = filterConfig[columnId]?.split;
		const values = new Set();
		let hasEmpty = false;

		for (const item of data) {
			const val = item[columnId];

			if (val == null || val === "") {
				hasEmpty = true;
				continue;
			}

			if (delimiter && typeof val === "string") {
				const parts = val.split(delimiter);
				for (const part of parts) {
					if (part === "") {
						hasEmpty = true;
					} else {
						values.add(part);
					}
				}
			} else {
				values.add(val);
			}
		}

		const sorted = Array.from(values).sort();
		if (hasEmpty) {
			sorted.push("无数据");
		}
		return sorted;
	};

	const handleMoveColumn = (index, direction) => {
		const currentOrder = table.getAllLeafColumns().map((c) => c.id);
		const newOrder = [...currentOrder];

		if (direction === "up" && index > 0) {
			[newOrder[index - 1], newOrder[index]] = [
				newOrder[index],
				newOrder[index - 1],
			];
		} else if (direction === "down" && index < newOrder.length - 1) {
			[newOrder[index + 1], newOrder[index]] = [
				newOrder[index],
				newOrder[index + 1],
			];
		}

		table.setColumnOrder(newOrder);
	};

	const isFilterActive = (val) => {
		if (!val) return false;
		if (val.categories?.length > 0) return true;
		if (val.range?.some((v) => v !== "")) return true;
		return false;
	};

	const updateFilterValue = (header, newVal) => {
		if (isFilterActive(newVal)) {
			header.column.setFilterValue(newVal);
		} else {
			header.column.setFilterValue(undefined);
		}
	};

	const filteredCount = table.getFilteredRowModel().rows.length;
	const totalCount = data.length;

	return (
		<div className="w-full flex flex-col gap-2">
			<div className="flex justify-between items-center w-full relative z-[40] px-1">
				<div className="text-sm opacity-95 font-medium select-none">
					{showItemCount && (
						<span>
							共 <span className={theme.primaryText}>{totalCount}</span> 条数据
							{filteredCount !== totalCount && (
								<span className="ml-2">
									(已筛选出{" "}
									<span className={theme.primaryText}>{filteredCount}</span> 条)
								</span>
							)}
						</span>
					)}
				</div>

				{enableColumnManagement && (
					// biome-ignore lint/a11y/noStaticElementInteractions: 仅作为阻止冒泡的容器
					// biome-ignore lint/a11y/useKeyWithClickEvents: 无需键盘交互
					<div onClick={(e) => e.stopPropagation()}>
						<button
							type="button"
							onClick={() => {
								setOpenManager(!openManager);
								setOpenFilterId(null);
							}}
							className={`flex transition items-center justify-center rounded-lg h-9 px-3 font-medium text-sm ${theme.btnPlain} ${
								openManager
									? `${theme.activeBg} ${theme.primaryText}`
									: "opacity-70 hover:opacity-100"
							}`}
						>
							<svg
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								width="1.2em"
								height="1.2em"
								viewBox="0 0 24 24"
								className="mr-1.5"
							>
								<path
									fill="currentColor"
									d="M12 15.5q-1.45 0-2.475-1.025T8.5 12q0-1.45 1.025-2.475T12 8.5q1.45 0 2.475 1.025T16.5 12q0 1.45-1.025 2.475T12 15.5m0-2q.625 0 1.063-.437T13.5 12q0-.625-.437-1.062T12 10.5q-.625 0-1.062.438T10.5 12q0 .625.438 1.063T12 13.5m-1 6.5v-2.25q-.425-.125-.812-.312t-.738-.438l-2.05.85l-1.9-3.3l1.7-1.325q-.05-.2-.075-.4T7 12q0-.2.025-.4t.075-.4l-1.7-1.325l1.9-3.3l2.05.85q.35-.25.738-.437t.812-.313V4h3.8v2.25q.425.125.813.313t.737.437l2.05-.85l1.9 3.3l-1.7 1.325q.05.2.075.4t.025.4q0 .2-.025.4t-.075.4l1.7 1.325l-1.9 3.3l-2.05-.85q-.35.25-.737.438t-.813.312V20z"
								/>
							</svg>
							表格设置
						</button>

						<div
							className={`absolute top-full right-0 pt-2 transition-all duration-200 origin-top-right ${
								openManager
									? "opacity-100 scale-100"
									: "opacity-0 scale-95 pointer-events-none"
							}`}
						>
							<div className={`p-2 min-w-[220px] font-normal ${theme.panel}`}>
								<div className="px-3 py-2 text-[0.75rem] font-bold opacity-50 uppercase tracking-wider">
									通用设置
								</div>
								<label
									className={`flex items-center gap-3 cursor-pointer w-full rounded-lg h-9 px-3 mb-1 ${theme.btnPlain}`}
								>
									<input
										type="checkbox"
										checked={showItemCount}
										onChange={(e) => setShowItemCount(e.target.checked)}
										className={`rounded focus:ring-0 focus:ring-offset-0 cursor-pointer flex-shrink-0 ${theme.primaryText} ${theme.input}`}
									/>
									<span className="text-sm select-none">显示条目总数</span>
								</label>
								<div className={`h-[1px] w-full my-1.5 ${theme.divider}`} />

								<div className="px-3 py-2 text-[0.75rem] font-bold opacity-50 uppercase tracking-wider">
									可见性与顺序
								</div>
								<div className="flex flex-col gap-0.5">
									{table.getAllLeafColumns().map((column, index) => {
										const headerName =
											typeof column.columnDef.header === "string"
												? column.columnDef.header
												: column.id;

										return (
											<div
												key={column.id}
												className={`flex items-center justify-between w-full rounded-lg h-9 px-3 ${theme.btnPlain} ${theme.hoverBg}`}
											>
												<label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
													<input
														type="checkbox"
														checked={column.getIsVisible()}
														onChange={column.getToggleVisibilityHandler()}
														className={`rounded focus:ring-0 focus:ring-offset-0 cursor-pointer flex-shrink-0 ${theme.primaryText} ${theme.input}`}
													/>
													<span className="text-sm truncate flex-1 text-left select-none">
														{headerName}
													</span>
												</label>

												<div className="flex items-center gap-1 ml-2 flex-shrink-0">
													<button
														type="button"
														onClick={() => handleMoveColumn(index, "up")}
														disabled={index === 0}
														className={`flex items-center justify-center w-6 h-6 rounded disabled:opacity-30 disabled:hover:bg-transparent transition ${theme.iconHover}`}
													>
														<svg
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															width="1em"
															height="1em"
															viewBox="0 0 24 24"
														>
															<path
																fill="currentColor"
																d="M7.4 15.4L6 14l6-6l6 6l-1.4 1.4l-4.6-4.6z"
															/>
														</svg>
													</button>
													<button
														type="button"
														onClick={() => handleMoveColumn(index, "down")}
														disabled={
															index === table.getAllLeafColumns().length - 1
														}
														className={`flex items-center justify-center w-6 h-6 rounded disabled:opacity-30 disabled:hover:bg-transparent transition ${theme.iconHover}`}
													>
														<svg
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															width="1em"
															height="1em"
															viewBox="0 0 24 24"
														>
															<path
																fill="currentColor"
																d="M7.4 8.6L6 10l6 6l6-6l-1.4-1.4l-4.6 4.6z"
															/>
														</svg>
													</button>
												</div>
											</div>
										);
									})}
								</div>
								<div className={`h-[1px] w-full my-1.5 ${theme.divider}`} />
								<button
									type="button"
									onClick={() => {
										table.toggleAllColumnsVisible(true);
										setColumnOrder([]);
										setShowItemCount(enableItemCount);
									}}
									className={`flex transition whitespace-nowrap items-center justify-center w-full rounded-lg h-9 px-3 font-medium opacity-70 hover:opacity-100 ${theme.btnPlain}`}
								>
									重置表格状态
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			<div className="overflow-x-auto w-full" style={{ minHeight: "300px" }}>
				<table className={`w-full ${theme.table}`}>
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header, index) => {
									const isFilterable = header.id in filterConfig;
									const filterCfgObj = filterConfig[header.id];

									const currentFilterObj = header.column.getFilterValue() || {
										categories: [],
										range: ["", ""],
									};
									const active = isFilterActive(header.column.getFilterValue());

									const isOpen = openFilterId === header.id;
									const isLastColumn = index === headerGroup.headers.length - 1;
									const isSorted = header.column.getIsSorted();

									const inputType =
										columnDataTypes[header.id] === "number" ? "number" : "text";

									return (
										<th
											key={header.id}
											className="relative"
											style={{ width: header.getSize(), padding: "0.5rem" }}
										>
											<div className="flex items-center justify-between gap-2">
												<button
													type="button"
													className={`flex-1 flex transition items-center justify-between w-full rounded-lg min-h-9 px-3 py-1 font-medium cursor-pointer select-none ${theme.btnPlain} ${
														isSorted ? theme.activeBg : ""
													}`}
													onClick={header.column.getToggleSortingHandler()}
												>
													<span className="truncate">
														{flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
													</span>
													<span className="opacity-40 text-[1rem] ml-1 flex-shrink-0">
														{{
															asc: (
																<svg
																	aria-hidden="true"
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
																	aria-hidden="true"
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
																aria-hidden="true"
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
												</button>

												{isFilterable && (
													// biome-ignore lint/a11y/noStaticElementInteractions: 仅作为阻止冒泡的容器
													// biome-ignore lint/a11y/useKeyWithClickEvents: 无需键盘交互
													<div
														className="relative"
														onClick={(e) => e.stopPropagation()}
													>
														<button
															type="button"
															onClick={() => {
																setOpenFilterId(isOpen ? null : header.id);
																setOpenManager(false);
															}}
															className={`flex transition items-center justify-center rounded-lg w-9 h-9 font-medium ${theme.btnPlain} ${
																active || isOpen
																	? `${theme.activeBg} ${theme.primaryText}`
																	: "opacity-60"
															}`}
														>
															<svg
																aria-hidden="true"
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

														<div
															className={`absolute z-[50] top-full pt-2 transition-all duration-200 ${
																isLastColumn
																	? "-right-2 origin-top-right"
																	: "-left-2 origin-top-left"
															} ${
																isOpen
																	? "opacity-100 scale-100"
																	: "opacity-0 scale-95 pointer-events-none"
															}`}
														>
															<div
																className={`p-2 min-w-[200px] max-w-[260px] sm:max-w-[300px] font-normal flex flex-col gap-1 ${theme.panel}`}
															>
																<div className="px-3 py-1.5 text-[0.75rem] font-bold opacity-50 uppercase tracking-wider">
																	筛选:{" "}
																	{typeof header.column.columnDef.header ===
																	"string"
																		? header.column.columnDef.header
																		: header.id}
																</div>

																{filterCfgObj.type.map((t, idx) => {
																	return (
																		<div key={t} className="flex flex-col">
																			{idx > 0 && (
																				<div
																					className={`h-[1px] w-full my-1.5 ${theme.divider}`}
																				/>
																			)}

																			{t === "category" && (
																				<div
																					className={`max-h-[200px] overflow-y-auto flex flex-col gap-0.5 ${theme.scrollbar}`}
																				>
																					{getUniqueValues(header.id).map(
																						(val) => {
																							const isChecked =
																								currentFilterObj.categories.includes(
																									val,
																								);
																							return (
																								<label
																									key={val}
																									className={`flex transition items-center !justify-start w-full rounded-lg h-9 px-3 font-medium cursor-pointer ${theme.btnPlain} ${
																										isChecked
																											? `${theme.activeBg} ${theme.primaryText}`
																											: ""
																									}`}
																								>
																									<input
																										type="checkbox"
																										className={`rounded focus:ring-0 focus:ring-offset-0 mr-3 cursor-pointer flex-shrink-0 ${theme.primaryText} ${theme.input}`}
																										checked={isChecked}
																										onChange={(e) => {
																											const checked =
																												e.target.checked;
																											const newCats = checked
																												? [
																														...currentFilterObj.categories,
																														val,
																													]
																												: currentFilterObj.categories.filter(
																														(v) => v !== val,
																													);

																											updateFilterValue(
																												header,
																												{
																													...currentFilterObj,
																													categories: newCats,
																												},
																											);
																										}}
																									/>
																									<span
																										className="text-sm truncate flex-1 min-w-0 text-left"
																										title={val}
																									>
																										{val}
																									</span>
																								</label>
																							);
																						},
																					)}
																				</div>
																			)}

																			{t === "range" && (
																				<div className="flex flex-col gap-2 px-1 py-1">
																					<input
																						type={inputType}
																						placeholder="下限"
																						value={currentFilterObj.range[0]}
																						onChange={(e) => {
																							updateFilterValue(header, {
																								...currentFilterObj,
																								range: [
																									e.target.value,
																									currentFilterObj.range[1],
																								],
																							});
																						}}
																						className={`w-full min-w-0 flex-1 rounded text-sm px-2.5 py-1.5 outline-none transition ${theme.input}`}
																					/>
																					<input
																						type={inputType}
																						placeholder="上限"
																						value={currentFilterObj.range[1]}
																						onChange={(e) => {
																							updateFilterValue(header, {
																								...currentFilterObj,
																								range: [
																									currentFilterObj.range[0],
																									e.target.value,
																								],
																							});
																						}}
																						className={`w-full min-w-0 flex-1 rounded text-sm px-2.5 py-1.5 outline-none transition ${theme.input}`}
																					/>
																				</div>
																			)}
																		</div>
																	);
																})}

																{active && (
																	<>
																		<div
																			className={`h-[1px] w-full my-1.5 ${theme.divider}`}
																		/>
																		<button
																			type="button"
																			onClick={() =>
																				header.column.setFilterValue(undefined)
																			}
																			className={`flex transition whitespace-nowrap items-center justify-center w-full rounded-lg h-9 px-3 font-medium ${theme.btnPlain} ${theme.dangerBtn}`}
																		>
																			清除所有
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
		</div>
	);
}
