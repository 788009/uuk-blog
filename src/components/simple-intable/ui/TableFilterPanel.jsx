import { useTableContext } from "../core/TableContext";
import { TableI18nKey } from "../i18n/translation.js";

export function TableFilterPanel({ header, isActive }) {
	const { theme, t, filterConfig, columnDataTypes, getUniqueValues } =
		useTableContext();

	const filterCfgObj = filterConfig[header.id];
	const currentFilterObj = header.column.getFilterValue() || {
		categories: [],
		range: ["", ""],
	};

	const inputType = columnDataTypes[header.id] === "number" ? "number" : "text";

	// Helper function: Determine if active and update
	const isFilterActive = (val) => {
		if (!val) return false;
		if (val.categories?.length > 0) return true;
		if (val.range?.some((v) => v !== "")) return true;
		return false;
	};

	const updateFilterValue = (newVal) => {
		if (isFilterActive(newVal)) {
			header.column.setFilterValue(newVal);
		} else {
			header.column.setFilterValue(undefined);
		}
	};

	return (
		<div className="p-2 min-w-[200px] max-w-[260px] sm:max-w-[300px] font-normal flex flex-col gap-1">
			<div className="px-3 py-1.5 text-[0.75rem] font-bold opacity-50 uppercase tracking-wider">
				{t(TableI18nKey.FILTER_PREFIX, {
					column:
						typeof header.column.columnDef.header === "string"
							? header.column.columnDef.header
							: header.id,
				})}
			</div>

			{filterCfgObj.type.map((tCategory, idx) => {
				return (
					<div key={tCategory} className="flex flex-col">
						{idx > 0 && (
							<div className={`h-[1px] w-full my-1.5 ${theme.divider}`} />
						)}

						{tCategory === "category" && (
							<div
								className={`max-h-[200px] overflow-y-auto flex flex-col gap-0.5 ${theme.scrollbar}`}
							>
								{getUniqueValues(header.id).map((val) => {
									const isChecked = currentFilterObj.categories.includes(val);
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
													const checked = e.target.checked;
													const newCats = checked
														? [...currentFilterObj.categories, val]
														: currentFilterObj.categories.filter(
																(v) => v !== val,
															);
													updateFilterValue({
														...currentFilterObj,
														categories: newCats,
													});
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
								})}
							</div>
						)}

						{tCategory === "range" && (
							<div className="flex flex-col gap-2 px-1 py-1">
								<input
									type={inputType}
									placeholder={t(TableI18nKey.MIN_LIMIT)}
									value={currentFilterObj.range[0]}
									onChange={(e) => {
										updateFilterValue({
											...currentFilterObj,
											range: [e.target.value, currentFilterObj.range[1]],
										});
									}}
									className={`w-full min-w-0 flex-1 rounded text-sm px-2.5 py-1.5 outline-none transition ${theme.input}`}
								/>
								<input
									type={inputType}
									placeholder={t(TableI18nKey.MAX_LIMIT)}
									value={currentFilterObj.range[1]}
									onChange={(e) => {
										updateFilterValue({
											...currentFilterObj,
											range: [currentFilterObj.range[0], e.target.value],
										});
									}}
									className={`w-full min-w-0 flex-1 rounded text-sm px-2.5 py-1.5 outline-none transition ${theme.input}`}
								/>
							</div>
						)}
					</div>
				);
			})}

			{isActive && (
				<>
					<div className={`h-[1px] w-full my-1.5 ${theme.divider}`} />
					<button
						type="button"
						onClick={() => header.column.setFilterValue(undefined)}
						className={`flex transition whitespace-nowrap items-center justify-center w-full rounded-lg h-9 px-3 font-medium ${theme.btnPlain} ${theme.dangerBtn}`}
					>
						{t(TableI18nKey.CLEAR_ALL)}
					</button>
				</>
			)}
		</div>
	);
}
