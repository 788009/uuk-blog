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
	} = useTableContext();

	const isFilterActive = (val) => {
		if (!val) return false;
		if (val.categories?.length > 0) return true;
		if (val.range?.some((v) => v !== "")) return true;
		return false;
	};

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

						return (
							<th
								key={header.id}
								className="relative"
								style={{ width: header.getSize(), padding: "0.5rem" }}
							>
								<div className="flex items-center justify-between gap-2">
									{/* Sorting trigger button */}
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
												asc: <SortUpIcon />,
												desc: <SortDownIcon />,
											}[isSorted] ?? <SortDefaultIcon />}
										</span>
									</button>

									{/* Filter trigger */}
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
													className={`flex transition items-center justify-center rounded-lg w-9 h-9 font-medium ${theme.btnPlain} ${
														active || isOpen
															? `${theme.activeBg} ${theme.primaryText}`
															: "opacity-60"
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
												<TableFilterPanel header={header} isActive={active} />
											</PopoverContent>
										</Popover>
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
