import { useCallback, useMemo } from "react";
import { TableI18nKey } from "../i18n/translation.js";

export function useTableFilters({ tableData, columns, t }) {
	// 1. Generate column filter configuration
	const filterConfig = useMemo(() => {
		const config = {};
		columns.forEach((col) => {
			const colId = col.id || col.accessorKey;
			if (colId && col.meta?.isFilterable) {
				let types = col.meta.filterType || ["category"];
				if (!Array.isArray(types)) types = [types];
				config[colId] = {
					split: col.meta.filterSplit,
					type: types,
				};
			}
		});
		return config;
	}, [columns]);

	// 2. Infer column data types (used to distinguish between numeric range and text filtering)
	const columnDataTypes = useMemo(() => {
		const types = {};
		columns.forEach((col) => {
			const id = col.accessorKey || col.id;
			const firstValid = tableData.find(
				(row) => row[id] != null && row[id] !== "",
			);
			types[id] = firstValid ? typeof firstValid[id] : "string";
		});
		return types;
	}, [columns, tableData]);

	// 3. Core filter function (called by the TanStack Table engine)
	const multiTypeFilter = useCallback(
		(row, columnId, filterValue) => {
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
						catMatch = categories.includes(t(TableI18nKey.NO_DATA));
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
		[filterConfig, columnDataTypes, t],
	);

	// 4. Get a list of unique values for a column (used to render checkboxes in the filter panel)
	const getUniqueValues = useCallback(
		(columnId) => {
			const delimiter = filterConfig[columnId]?.split;
			const values = new Set();
			let hasEmpty = false;

			for (const item of tableData) {
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
				sorted.push(t(TableI18nKey.NO_DATA));
			}
			return sorted;
		},
		[tableData, filterConfig, t],
	);

	return {
		filterConfig,
		columnDataTypes,
		multiTypeFilter,
		getUniqueValues,
	};
}
