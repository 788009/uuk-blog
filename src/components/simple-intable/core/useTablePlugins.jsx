import { useMemo } from "react";

export function useTablePlugins(columns, plugins = {}) {
	return useMemo(() => {
		return columns.map((col) => {
			const cellType = col.meta?.cellType;

			// If the column has a cellType configured and a corresponding plugin component is provided
			if (cellType && plugins[cellType]) {
				const PluginComponent = plugins[cellType];
				return {
					...col,
					cell: (info) => <PluginComponent info={info} />,
				};
			}

			// If no matching plugin is found, keep it as is for the underlying layer to render
			return col;
		});
	}, [columns, plugins]);
}
