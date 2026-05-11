import { flexRender } from "@tanstack/react-table";
import { useTableContext } from "../core/TableContext";
import { TableI18nKey } from "../i18n/translation.js";

export function TableBody() {
	const { table, isLoading, fetchError, theme, t, columns } = useTableContext();

	const rows = table.getRowModel().rows;
	const colSpan = columns.length;

	// 情况 A: 加载中
	if (isLoading) {
		return (
			<StatusRow colSpan={colSpan}>
				{t(TableI18nKey.LOADING)}
			</StatusRow>
		);
	}

	// 情况 B: 获取数据失败
	if (fetchError) {
		return (
			<StatusRow colSpan={colSpan} className={theme.dangerBtn}>
				{t(TableI18nKey.LOAD_FAILED, { error: fetchError })}
			</StatusRow>
		);
	}

	// 情况 C: 数据为空（包括过滤后无结果）
	if (rows.length === 0) {
		return (
			<StatusRow colSpan={colSpan}>
				{t(TableI18nKey.NO_DATA)}
			</StatusRow>
		);
	}

	// 情况 D: 正常渲染行
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

// 辅助组件：渲染状态反馈行
function StatusRow({ children, colSpan, className = "opacity-50" }) {
	return (
		<tbody>
			<tr>
				<td colSpan={colSpan} className={`p-6 text-center text-sm ${className}`}>
					{children}
				</td>
			</tr>
		</tbody>
	);
}
