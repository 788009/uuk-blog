import { useEffect, useState } from "react";
import { useTableContext } from "../core/TableContext";
import { TableI18nKey } from "../i18n/translation.js";
import { Popover, PopoverContent, PopoverTrigger } from "../shared/Popover";

export function TableToolbar() {
	const {
		table,
		tableData,
		isLoading,
		fetchError,
		theme,
		t,
		enableColumnManagement,
		enableItemCount,
		setOpenFilterId,
		maxHeight,
		setMaxHeight,
		stickyHeader,
		setStickyHeader,
		stickyFirstCol,
		setStickyFirstCol,
		columnWidths,
		setColumnWidths,
		headerAlign: globalHeaderAlign,
		cellAlign: globalCellAlign,
		columnHeaderAligns,
		setColumnHeaderAligns,
		columnCellAligns,
		setColumnCellAligns,
	} = useTableContext();

	const [showItemCount, setShowItemCount] = useState(enableItemCount);
	const [openManager, setOpenManager] = useState(false);
	const [localMaxHeight, setLocalMaxHeight] = useState(maxHeight || "");

	const filteredCount = table.getFilteredRowModel().rows.length;
	const totalCount = tableData.length;

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

	const handleWidthChange = (columnId, val) => {
		setColumnWidths((prev) => ({
			...prev,
			[columnId]: val,
		}));
	};

	useEffect(() => {
		const val = localMaxHeight.trim();
		if (/^\d+$/.test(val)) {
			setMaxHeight?.(`${val}px`);
		} else {
			setMaxHeight?.(val);
		}
	}, [localMaxHeight, setMaxHeight]);

	const isHeaderFreezeDisabled = !localMaxHeight.trim();

	return (
		<div className="flex justify-between items-center w-full relative z-[40] px-1">
			<div className="text-sm opacity-95 font-medium select-none">
				{showItemCount && !isLoading && !fetchError && (
					<span>
						{t(TableI18nKey.TOTAL_ITEMS).split("{total}")[0]}
						<span className={theme.primaryText}>{totalCount}</span>
						{t(TableI18nKey.TOTAL_ITEMS).split("{total}")[1]}

						{filteredCount !== totalCount && (
							<span className="ml-2">
								{t(TableI18nKey.FILTERED_ITEMS).split("{filtered}")[0]}
								<span className={theme.primaryText}>{filteredCount}</span>
								{t(TableI18nKey.FILTERED_ITEMS).split("{filtered}")[1]}
							</span>
						)}
					</span>
				)}
			</div>

			{enableColumnManagement && (
				<Popover
					open={openManager}
					onOpenChange={(val) => {
						setOpenManager(val);
						if (val) setOpenFilterId(null);
					}}
				>
					<PopoverTrigger theme={theme}>
						<button
							type="button"
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
							{t(TableI18nKey.TABLE_SETTINGS)}
						</button>
					</PopoverTrigger>

					<PopoverContent
						positionClass="top-full right-0 origin-top-right"
						theme={theme}
					>
						<div className="p-2 min-w-[280px] font-normal">
							{/* General Settings */}
							<div className="px-3 py-2 text-[0.75rem] font-bold opacity-50 uppercase tracking-wider">
								{t(TableI18nKey.GENERAL_SETTINGS)}
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
								<span className="text-sm select-none">
									{t(TableI18nKey.SHOW_TOTAL)}
								</span>
							</label>

							<div className={`h-[1px] w-full my-1.5 ${theme.divider}`} />

							{/* Layout & Freeze */}
							<div className="px-3 py-2 text-[0.75rem] font-bold opacity-50 uppercase tracking-wider">
								{t(TableI18nKey.LAYOUT_SETTINGS)}
							</div>

							<div className="px-3 mb-2 flex items-center justify-between gap-2">
								<span className="text-sm select-none opacity-80 whitespace-nowrap">
									{t(TableI18nKey.MAX_HEIGHT)}
								</span>
								<input
									type="text"
									value={localMaxHeight}
									onChange={(e) => setLocalMaxHeight(e.target.value)}
									placeholder={t(TableI18nKey.MAX_HEIGHT_PLACEHOLDER)}
									className={`w-28 min-w-0 rounded text-sm px-2.5 py-1 outline-none transition ${theme.input}`}
								/>
							</div>

							<label
								className={`flex items-center justify-start gap-3 w-full rounded-lg h-9 px-3 mb-1 transition-opacity ${
									isHeaderFreezeDisabled
										? "opacity-40 cursor-not-allowed"
										: `cursor-pointer ${theme.btnPlain}`
								}`}
							>
								<input
									type="checkbox"
									checked={stickyHeader}
									disabled={isHeaderFreezeDisabled}
									onChange={(e) => setStickyHeader?.(e.target.checked)}
									className={`rounded focus:ring-0 focus:ring-offset-0 flex-shrink-0 ${theme.primaryText} ${theme.input} ${
										isHeaderFreezeDisabled
											? "cursor-not-allowed"
											: "cursor-pointer"
									}`}
								/>
								<span className="text-sm select-none text-left flex-1">
									{t(TableI18nKey.FREEZE_HEADER)}
								</span>
							</label>

							<label
								className={`flex items-center justify-start gap-3 w-full rounded-lg h-9 px-3 mb-1 transition-opacity cursor-pointer ${theme.btnPlain}`}
							>
								<input
									type="checkbox"
									checked={stickyFirstCol}
									onChange={(e) => setStickyFirstCol?.(e.target.checked)}
									className={`rounded focus:ring-0 focus:ring-offset-0 flex-shrink-0 ${theme.primaryText} ${theme.input} cursor-pointer`}
								/>
								<span className="text-sm select-none text-left flex-1">
									{t(TableI18nKey.FREEZE_FIRST_COL)}
								</span>
							</label>

							<div className="px-3 mt-1 mb-2">
								<button
									type="button"
									onClick={() => {
										setLocalMaxHeight("");
										setStickyHeader?.(false);
										setStickyFirstCol?.(false);
									}}
									className={`flex transition whitespace-nowrap items-center justify-center w-full rounded h-7 px-3 text-xs font-medium opacity-60 hover:opacity-100 ${theme.btnPlain} ${theme.hoverBg}`}
								>
									{t(TableI18nKey.RESET_LAYOUT_STATE)}
								</button>
							</div>

							<div className={`h-[1px] w-full my-1.5 ${theme.divider}`} />

							{/* Visibility & Order */}
							<div className="px-3 py-2 text-[0.75rem] font-bold opacity-50 uppercase tracking-wider">
								{t(TableI18nKey.VISIBILITY_AND_ORDER)}
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
											className={`flex flex-col w-full rounded-lg px-2 py-1.5 mb-1 transition-colors border border-transparent ${theme.hoverBg} dark:hover:border-gray-700 hover:border-gray-200`}
										>
											{/* Top Row: Visibility & Ordering */}
											<div className="flex items-center justify-between w-full h-7">
												<label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 pr-2">
													<input
														type="checkbox"
														checked={column.getIsVisible()}
														onChange={column.getToggleVisibilityHandler()}
														className={`rounded focus:ring-0 focus:ring-offset-0 cursor-pointer flex-shrink-0 ${theme.primaryText} ${theme.input}`}
													/>
													<span className="text-sm font-medium truncate flex-1 text-left select-none">
														{headerName}
													</span>
												</label>

												<div className="flex items-center gap-0.5 flex-shrink-0">
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

											{/* Bottom Row: Properties Grid (Width, Header Align, Cell Align) */}
											<div className="grid grid-cols-3 gap-2 pl-7 mt-1.5 w-full">
												{/* Column Width */}
												<div className="flex flex-col gap-0.5">
													<span className="text-[0.65rem] font-medium opacity-50 whitespace-nowrap select-none">
														{t(TableI18nKey.COLUMN_WIDTH)}
													</span>
													<input
														type="text"
														value={columnWidths[column.id] || ""}
														onChange={(e) =>
															handleWidthChange(column.id, e.target.value)
														}
														placeholder="auto"
														className={`w-full text-xs px-1.5 py-0.5 rounded outline-none transition ${theme.input}`}
													/>
												</div>

												{/* Header Alignment */}
												<div className="flex flex-col gap-0.5">
													<span className="text-[0.65rem] font-medium opacity-50 whitespace-nowrap select-none">
														{t(TableI18nKey.HEADER_ALIGN)}
													</span>
													<select
														value={
															columnHeaderAligns[column.id] ||
															column.columnDef.meta?.headerAlign ||
															globalHeaderAlign ||
															"center"
														}
														onChange={(e) =>
															setColumnHeaderAligns((prev) => ({
																...prev,
																[column.id]: e.target.value,
															}))
														}
														className={`w-full rounded pl-0.5 pr-6 py-0.5 text-xs bg-transparent border outline-none transition cursor-pointer ${theme.input}`}
													>
														<option
															value="left"
															className="text-black dark:text-white bg-white dark:bg-gray-800"
														>
															{t(TableI18nKey.ALIGN_LEFT)}
														</option>
														<option
															value="center"
															className="text-black dark:text-white bg-white dark:bg-gray-800"
														>
															{t(TableI18nKey.ALIGN_CENTER)}
														</option>
														<option
															value="right"
															className="text-black dark:text-white bg-white dark:bg-gray-800"
														>
															{t(TableI18nKey.ALIGN_RIGHT)}
														</option>
													</select>
												</div>

												{/* Cell Alignment */}
												<div className="flex flex-col gap-0.5">
													<span className="text-[0.65rem] font-medium opacity-50 whitespace-nowrap select-none">
														{t(TableI18nKey.CELL_ALIGN)}
													</span>
													<select
														value={
															columnCellAligns[column.id] ||
															column.columnDef.meta?.cellAlign ||
															globalCellAlign ||
															"left"
														}
														onChange={(e) =>
															setColumnCellAligns((prev) => ({
																...prev,
																[column.id]: e.target.value,
															}))
														}
														className={`w-full rounded pl-0.5 pr-6 py-0.5 text-xs bg-transparent border outline-none transition cursor-pointer ${theme.input}`}
													>
														<option
															value="left"
															className="text-black dark:text-white bg-white dark:bg-gray-800"
														>
															{t(TableI18nKey.ALIGN_LEFT)}
														</option>
														<option
															value="center"
															className="text-black dark:text-white bg-white dark:bg-gray-800"
														>
															{t(TableI18nKey.ALIGN_CENTER)}
														</option>
														<option
															value="right"
															className="text-black dark:text-white bg-white dark:bg-gray-800"
														>
															{t(TableI18nKey.ALIGN_RIGHT)}
														</option>
													</select>
												</div>
											</div>
										</div>
									);
								})}
							</div>

							<div className={`h-[1px] w-full my-1.5 ${theme.divider}`} />

							{/* Reset Table State Button */}
							<button
								type="button"
								onClick={() => {
									table.toggleAllColumnsVisible(true);
									table.setColumnOrder([]);
									setShowItemCount(enableItemCount);
									setLocalMaxHeight("");
									setStickyHeader?.(false);
									setStickyFirstCol?.(false);
									setColumnWidths({});
									setColumnHeaderAligns({});
									setColumnCellAligns({});
								}}
								className={`flex transition whitespace-nowrap items-center justify-center w-full rounded-lg h-9 px-3 font-medium opacity-70 hover:opacity-100 ${theme.btnPlain}`}
							>
								{t(TableI18nKey.RESET_STATE)}
							</button>
						</div>
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
}
