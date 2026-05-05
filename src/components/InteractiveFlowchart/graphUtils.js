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
 * 使用深度优先搜索 (DFS) 查找起点到终点的所有简单路径
 * @param {Record<string, string[]>} graph 邻接表
 * @param {string} source 起点节点 ID
 * @param {string} target 终点节点 ID
 * @returns {string[][]} 路径数组，每个路径是一个节点 ID 的数组
 */
export function findAllPaths(graph, source, target) {
	const paths = [];
	const visited = new Set();

	function dfs(current, currentPath) {
		if (current === target) {
			paths.push([...currentPath]);
			return;
		}

		visited.add(current);
		const neighbors = graph[current] || [];

		for (const neighbor of neighbors) {
			if (!visited.has(neighbor)) {
				currentPath.push(neighbor);
				dfs(neighbor, currentPath);
				currentPath.pop();
			}
		}

		visited.delete(current);
	}

	dfs(source, [source]);
	return paths;
}
