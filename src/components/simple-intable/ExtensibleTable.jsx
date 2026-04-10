import { useMemo } from "react";
import InteractiveTable from "./InteractiveTable";

export default function ExtensibleTable({
	columns,
	plugins = {},
	...restProps
}) {
	const enhancedColumns = useMemo(() => {
		return columns.map((col) => {
			const cellType = col.meta?.cellType;

			// 如果列配置了 cellType，且外部传入了对应的插件组件
			if (cellType && plugins[cellType]) {
				const PluginComponent = plugins[cellType];
				return {
					...col,
					cell: (info) => <PluginComponent info={info} />,
				};
			}

			// 如果没有匹配的插件，保持原样交由底层渲染
			return col;
		});
	}, [columns, plugins]);

	return <InteractiveTable {...restProps} columns={enhancedColumns} />;
}
