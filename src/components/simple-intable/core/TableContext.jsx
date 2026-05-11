import { createContext, useContext } from "react";

// Create Context
const TableContext = createContext(null);

// Provide a convenient Hook for the view layer to call
export function useTableContext() {
	const context = useContext(TableContext);
	if (!context) {
		throw new Error("useTableContext must be used within a TableProvider");
	}
	return context;
}

export default TableContext;
