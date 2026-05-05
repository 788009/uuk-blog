// ==========================================
// 提取图的邻接表
// ==========================================
export function extractGraphFromSvg(svgElement) {
	const adjacencyList = {};
	const nodeElements = svgElement.querySelectorAll(".node[id]");
	const nodeIds = Array.from(nodeElements)
		.map((el) => {
			const match = el.getAttribute("id").match(/-flowchart-(.+)-\d+$/);
			return match ? match[1] : null;
		})
		.filter(Boolean);

	const sortedNodes = Array.from(new Set(nodeIds)).sort(
		(a, b) => b.length - a.length,
	);

	const paths = svgElement.querySelectorAll(".edgePaths path[data-id]");
	paths.forEach((path) => {
		const dataId = path.getAttribute("data-id");
		if (!dataId || !dataId.startsWith("L_")) return;

		let fromNode = null;
		let toNode = null;

		for (const node1 of sortedNodes) {
			for (const node2 of sortedNodes) {
				if (dataId.startsWith(`L_${node1}_${node2}_`)) {
					fromNode = node1;
					toNode = node2;
					break;
				}
			}
			if (fromNode) break;
		}

		if (fromNode && toNode) {
			if (!adjacencyList[fromNode]) adjacencyList[fromNode] = [];
			if (!adjacencyList[fromNode].includes(toNode)) {
				adjacencyList[fromNode].push(toNode);
			}
		}
	});

	return adjacencyList;
}

// ==========================================
// 极简寻路引擎：严格无环简单路径 (Simple Paths Only)
// ==========================================
export function findAllPaths(graph, source, target) {
	const allPaths = [];
	const MAX_DEPTH = 40; // 防止超大图导致堆栈溢出

	function dfs(current, currentPathNodes) {
		// 如果抵达终点，保存这条路线并结束当前分支的探索
		if (current === target) {
			allPaths.push([...currentPathNodes]);
			return;
		}

		// 物理防爆栈
		if (currentPathNodes.length >= MAX_DEPTH) return;

		const neighbors = graph[current] || [];

		for (const neighbor of neighbors) {
			// 如果你要去的下一个节点，已经存在于你走过的路中，说明你绕圈子了。
			// 只有当前方是一个全新的、没去过的节点时，才允许走过去
			if (!currentPathNodes.includes(neighbor)) {
				currentPathNodes.push(neighbor); // 踏上新节点

				dfs(neighbor, currentPathNodes); // 继续往下探索

				currentPathNodes.pop(); // 探索完毕，退回一步，换条路试
			}
		}
	}

	// 探险家从起点出发，当前路径记录里只有起点
	dfs(source, [source]);

	return allPaths;
}
