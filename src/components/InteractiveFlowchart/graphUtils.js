/**
 * 从 Mermaid 生成的 SVG 中逆向提取图的邻接表 (Adjacency List)
 * @param {SVGSVGElement} svgElement
 * @returns {Record<string, string[]>} 邻接表对象
 */
export function extractGraphFromSvg(svgElement) {
	const adjacencyList = {};

	// 1. 获取所有节点的原始 ID
	const nodeElements = svgElement.querySelectorAll(".node[id]");
	const nodeIds = Array.from(nodeElements)
		.map((el) => {
			// Mermaid 的节点 ID 格式类似: mermaid-<hash>-flowchart-<NODE_ID>-<idx>
			const match = el.getAttribute("id").match(/-flowchart-(.+)-\d+$/);
			return match ? match[1] : null;
		})
		.filter(Boolean);

	// 按照长度降序排序，防止前缀匹配时出错 (例如 A_1 和 A)
	const sortedNodes = Array.from(new Set(nodeIds)).sort(
		(a, b) => b.length - a.length,
	);

	// 2. 遍历所有连线解析依赖关系
	const paths = svgElement.querySelectorAll(".edgePaths path[data-id]");
	paths.forEach((path) => {
		const dataId = path.getAttribute("data-id");
		if (!dataId || !dataId.startsWith("L_")) return; // 格式: L_{from}_{to}_{idx}

		let fromNode = null;
		let toNode = null;

		// 通过匹配节点 ID 还原连线的起点和终点
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

/**
 * 使用深度优先搜索 (DFS) 查找起点到终点的所有路径（允许节点重复，不允许边重复）
 * @param {Record<string, string[]>} graph 邻接表
 * @param {string} source 起点节点 ID
 * @param {string} target 终点节点 ID
 * @returns {string[][]} 路径数组
 */
export function findAllPaths(graph, source, target) {
	const paths = [];
	const visitedEdges = new Set();

	// 安全阈值：如果路径长度阈值，强制剪枝，防止极度复杂的反馈环导致浏览器卡死
	const MAX_DEPTH = 50;

	function dfs(current, currentPath) {
		// 到达终点，记录路径
		if (current === target) {
			paths.push([...currentPath]);
			return;
		}

		// 超过深度限制，提前返回
		if (currentPath.length >= MAX_DEPTH) {
			return;
		}

		const neighbors = graph[current] || [];

		for (const neighbor of neighbors) {
			// 用 "起点->终点" 的字符串作为边的唯一标识
			const edgeKey = `${current}->${neighbor}`;

			// 如果这条连线没有走过，就可以走（即使节点之前来过）
			if (!visitedEdges.has(edgeKey)) {
				visitedEdges.add(edgeKey);
				currentPath.push(neighbor);

				dfs(neighbor, currentPath);

				// 回溯：离开时将边移除，以便其他路径组合可以使用
				currentPath.pop();
				visitedEdges.delete(edgeKey);
			}
		}
	}

	dfs(source, [source]);
	return paths;
}
