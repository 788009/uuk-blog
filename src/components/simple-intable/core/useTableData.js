import { useEffect, useState } from "react";

export function useTableData(initialData) {
	const [tableData, setTableData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [fetchError, setFetchError] = useState(null);

	useEffect(() => {
		if (Array.isArray(initialData)) {
			setTableData(initialData);
			setIsLoading(false);
			setFetchError(null);
		} else if (typeof initialData === "string" && initialData.trim() !== "") {
			setIsLoading(true);
			setFetchError(null);
			fetch(initialData)
				.then((res) => {
					if (!res.ok) {
						throw new Error(`HTTP error! status: ${res.status}`);
					}
					return res.json();
				})
				.then((json) => {
					if (Array.isArray(json)) {
						setTableData(json);
					} else {
						throw new Error("Fetched JSON is not an array");
					}
					setIsLoading(false);
				})
				.catch((err) => {
					console.error("Failed to fetch table data:", err);
					setFetchError(err.message);
					setIsLoading(false);
					setTableData([]);
				});
		} else {
			setTableData([]);
			setIsLoading(false);
		}
	}, [initialData]);

	return { tableData, isLoading, fetchError };
}
