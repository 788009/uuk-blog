import { flexRender } from "@tanstack/react-table";
import { useTableContext } from "../core/TableContext";
import { Popover, PopoverContent, PopoverTrigger } from "../shared/Popover";
import { TableFilterPanel } from "./TableFilterPanel";

export function TableHeader() {
	const {
		table,
		theme,
		filterConfig,
		openFilterId,
		setOpenFilterId,
		setOpenManager,
		maxHeight,
		stickyHeader,
		stickyFirstCol,
		columnWidths,
		columnHeaderAligns,
		headerAlign: globalHeaderAlign,
	} = useTableContext();

	const isFilterActive = (val) => {
		if (!val) return false;
		if (val.categories?.length > 0) return true;
		if (val.range?.some((v) => v !== "")) return true;
		return false;
	};

	const isStickyTopActive = stickyHeader && maxHeight;

	return (
		<thead>
			{table.getHeaderGroups().map((headerGroup) => (
				<tr key={headerGroup.id}>
					{headerGroup.headers.map((header, index) => {
						const isFilterable = header.id in filterConfig;
						const active = isFilterActive(header.column.getFilterValue());
						const isOpen = openFilterId === header.id;
						const isLastColumn = index === headerGroup.headers.length - 1;
						const isSorted = header.column.getIsSorted();
						const isFirstCol = index === 0;

						const headerAlign =
							columnHeaderAligns[header.id] ||
							header.column.columnDef.meta?.headerAlign ||
							globalHeaderAlign ||
							"center";

						let thClasses = "relative ";

						if (isStickyTopActive && isFirstCol && stickyFirstCol) {
							thClasses += `sticky top-0 left-0 z-[20] ${theme.headerBg}`;
						} else if (isStickyTopActive) {
							thClasses += `sticky top-0 z-[10] ${theme.headerBg}`;
						} else if (isFirstCol && stickyFirstCol) {
							thClasses += `sticky left-0 z-[11] ${theme.headerBg}`;
						}

						let customWidth =
							columnWidths[header.id] || columnWidths[header.column.id];
						if (customWidth && /^\d+$/.test(customWidth.trim())) {
							customWidth = `${customWidth.trim()}px`;
						}
						const finalWidth = customWidth || header.getSize();

						return (
							<th
								key={header.id}
								className={thClasses}
								style={{
									width: finalWidth,
									minWidth: finalWidth,
									padding: "0.75rem",
								}}
							>
								<div className="w-full min-h-9 py-1 flex items-center">
									{headerAlign === "center" ? (
										/* Center Alignment Layout */
										<div className="w-full flex items-center justify-between gap-2">
											{/* Hidden left spacer to perfectly balance the right buttons for absolute centering */}
											<div className="flex items-center gap-1 invisible pointer-events-none flex-shrink-0">
												<div className="w-8 h-8" />
												{isFilterable && <div className="w-8 h-8" />}
											</div>

											<div className="whitespace-nowrap text-center select-none font-medium opacity-90">
												{flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
											</div>
											<div className="flex items-center justify-start gap-1 flex-shrink-0">
												{/* Individual Sort Button */}
												<button
													type="button"
													className={`flex items-center justify-center rounded-lg w-8 h-8 transition ${theme.btnPlain} ${
														isSorted
															? `${theme.activeBg} ${theme.primaryText}`
															: `opacity-60 ${theme.iconHover}`
													}`}
													onClick={header.column.getToggleSortingHandler()}
												>
													<span className="text-[1.1rem]">
														{{
															asc: <SortUpIcon />,
															desc: <SortDownIcon />,
														}[isSorted] ?? <SortDefaultIcon />}
													</span>
												</button>

												{/* Individual Filter Button */}
												{isFilterable && (
													<Popover
														open={isOpen}
														onOpenChange={(val) => {
															setOpenFilterId(val ? header.id : null);
															if (val) setOpenManager?.(false);
														}}
													>
														<PopoverTrigger theme={theme}>
															<button
																type="button"
																className={`flex transition items-center justify-center rounded-lg w-8 h-8 font-medium ${theme.btnPlain} ${
																	active || isOpen
																		? `${theme.activeBg} ${theme.primaryText}`
																		: `opacity-60 ${theme.iconHover}`
																}`}
															>
																<FilterIcon />
															</button>
														</PopoverTrigger>

														<PopoverContent
															theme={theme}
															positionClass={
																isLastColumn
																	? "top-full -right-2 origin-top-right"
																	: "top-full -left-2 origin-top-left"
															}
														>
															<TableFilterPanel
																header={header}
																isActive={active}
															/>
														</PopoverContent>
													</Popover>
												)}
											</div>
										</div>
									) : (
										/* Left or Right Alignment Layout */
										<div
											className={`w-full flex items-center gap-2 ${
												headerAlign === "right"
													? "justify-end"
													: "justify-start"
											}`}
										>
											{headerAlign === "right" ? (
												<>
													{/* Buttons on the left for right-aligned columns */}
													<div className="flex items-center gap-1 flex-shrink-0">
														{/* Individual Sort Button */}
														<button
															type="button"
															className={`flex items-center justify-center rounded-lg w-8 h-8 transition ${theme.btnPlain} ${
																isSorted
																	? `${theme.activeBg} ${theme.primaryText}`
																	: `opacity-60 ${theme.iconHover}`
															}`}
															onClick={header.column.getToggleSortingHandler()}
														>
															<span className="text-[1.1rem]">
																{{
																	asc: <SortUpIcon />,
																	desc: <SortDownIcon />,
																}[isSorted] ?? <SortDefaultIcon />}
															</span>
														</button>

														{/* Individual Filter Button */}
														{isFilterable && (
															<Popover
																open={isOpen}
																onOpenChange={(val) => {
																	setOpenFilterId(val ? header.id : null);
																	if (val) setOpenManager?.(false);
																}}
															>
																<PopoverTrigger theme={theme}>
																	<button
																		type="button"
																		className={`flex transition items-center justify-center rounded-lg w-8 h-8 font-medium ${theme.btnPlain} ${
																			active || isOpen
																				? `${theme.activeBg} ${theme.primaryText}`
																				: `opacity-60 ${theme.iconHover}`
																		}`}
																	>
																		<FilterIcon />
																	</button>
																</PopoverTrigger>

																<PopoverContent
																	theme={theme}
																	positionClass={
																		isLastColumn
																			? "top-full -right-2 origin-top-right"
																			: "top-full -left-2 origin-top-left"
																	}
																>
																	<TableFilterPanel
																		header={header}
																		isActive={active}
																	/>
																</PopoverContent>
															</Popover>
														)}
													</div>

													{/* Text on the absolute right */}
													<div className="whitespace-nowrap select-none font-medium opacity-90">
														{flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
													</div>
												</>
											) : (
												<>
													{/* Text on the absolute left for left-aligned columns */}
													<div className="whitespace-nowrap select-none font-medium opacity-90">
														{flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
													</div>

													{/* Buttons on the right */}
													<div className="flex items-center gap-1 flex-shrink-0">
														{/* Individual Sort Button */}
														<button
															type="button"
															className={`flex items-center justify-center rounded-lg w-8 h-8 transition ${theme.btnPlain} ${
																isSorted
																	? `${theme.activeBg} ${theme.primaryText}`
																	: `opacity-60 ${theme.iconHover}`
															}`}
															onClick={header.column.getToggleSortingHandler()}
														>
															<span className="text-[1.1rem]">
																{{
																	asc: <SortUpIcon />,
																	desc: <SortDownIcon />,
																}[isSorted] ?? <SortDefaultIcon />}
															</span>
														</button>

														{/* Individual Filter Button */}
														{isFilterable && (
															<Popover
																open={isOpen}
																onOpenChange={(val) => {
																	setOpenFilterId(val ? header.id : null);
																	if (val) setOpenManager?.(false);
																}}
															>
																<PopoverTrigger theme={theme}>
																	<button
																		type="button"
																		className={`flex transition items-center justify-center rounded-lg w-8 h-8 font-medium ${theme.btnPlain} ${
																			active || isOpen
																				? `${theme.activeBg} ${theme.primaryText}`
																				: `opacity-60 ${theme.iconHover}`
																		}`}
																	>
																		<FilterIcon />
																	</button>
																</PopoverTrigger>

																<PopoverContent
																	theme={theme}
																	positionClass={
																		isLastColumn
																			? "top-full -right-2 origin-top-right"
																			: "top-full -left-2 origin-top-left"
																	}
																>
																	<TableFilterPanel
																		header={header}
																		isActive={active}
																	/>
																</PopoverContent>
															</Popover>
														)}
													</div>
												</>
											)}
										</div>
									)}
								</div>
							</th>
						);
					})}
				</tr>
			))}
		</thead>
	);
}

// Internal icon sub-components
const SortUpIcon = () => (
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
);
const SortDownIcon = () => (
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
);
const SortDefaultIcon = () => (
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
);
const FilterIcon = () => (
	<svg
		aria-hidden="true"
		xmlns="http://www.w3.org/2000/svg"
		width="1.2em"
		height="1.2em"
		viewBox="0 0 24 24"
	>
		<path fill="currentColor" d="M10 18h4v-2h-4zM3 6v2h18V6zm3 7h12v-2H6z" />
	</svg>
);
