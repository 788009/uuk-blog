import { flexRender } from "@tanstack/react-table";
import { useTableContext } from "../core/TableContext";
import { TableI18nKey } from "../i18n/translation.js";

export function TableBody() {
	const { table, isLoading, fetchError, theme, t, columns } = useTableContext();

	const rows = table.getRowModel().rows;
	const colSpan = columns.length;

	// Case A: Loading
	if (isLoading) {
		return <StatusRow colSpan={colSpan}>{t(TableI18nKey.LOADING)}</StatusRow>;
	}

	// Case B: Failed to fetch data
	if (fetchError) {
		return (
			<StatusRow colSpan={colSpan} className={theme.dangerBtn}>
				{t(TableI18nKey.LOAD_FAILED, { error: fetchError })}
			</StatusRow>
		);
	}

	// Case C: Empty data (including no results after filtering)
	if (rows.length === 0) {
		return <StatusRow colSpan={colSpan}>{t(TableI18nKey.NO_DATA)}</StatusRow>;
	}

	// Case D: Render rows normally
	return (
		<tbody>
			{rows.map((row) => (
				<tr key={row.id}>
					{row.getVisibleCells().map((cell) => (
						<td key={cell.id} className="p-3">
							{flexRender(cell.column.columnDef.cell, cell.getContext())}
						</td>
					))}
				</tr>
			))}
		</tbody>
	);
}

// Helper component: Renders a status feedback row
function StatusRow({ children, colSpan, className = "opacity-50" }) {
	return (
		<tbody>
			<tr>
				<td
					colSpan={colSpan}
					className={`p-6 text-center text-sm ${className}`}
				>
					{children}
				</td>
			</tr>
		</tbody>
	);
}
