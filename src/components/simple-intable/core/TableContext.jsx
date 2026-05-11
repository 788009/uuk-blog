import { createContext, useContext } from "react";

// 创建 Context
const TableContext = createContext(null);

// 提供一个便捷的 Hook 供视图层调用
export function useTableContext() {
	const context = useContext(TableContext);
	if (!context) {
		throw new Error("useTableContext must be used within a TableProvider");
	}
	return context;
}

export default TableContext;
