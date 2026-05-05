// ==========================================
// 提取图的邻接表
// ==========================================
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
		if (!dataId || !dataId.startsWith("L_")) return;

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

export function findAllPaths(graph, source, target) {
	const successPaths = []; // 成功抵达终点的直线路径 (无环)
	const cyclePaths = []; // 遇到已访问节点而回头的路径 (可能是有用的环，也可能是死胡同)

	const MAX_DEPTH = 30;

	// 1. 探索地图阶段
	function dfs(current, currentPathNodes, currentPathEdges) {
		if (current === target) {
			successPaths.push([...currentPathEdges]);
			return;
		}

		if (currentPathNodes.length >= MAX_DEPTH) return;

		const neighbors = graph[current] || [];

		for (const neighbor of neighbors) {
			// 原点排斥：为了避免视觉冗余，严格禁止绕了一大圈回到起点的线
			if (neighbor === source) continue;

			const edgeKey = `${current}->${neighbor}`;

			// 如果发现邻居已经在当前路径里（说明成环了）
			if (currentPathNodes.includes(neighbor)) {
				// 记下这条路，包含这最后一条“回头边”，然后回头（不继续深入）
				cyclePaths.push([...currentPathEdges, edgeKey]);
				continue;
			}

			// 正常往前走
			currentPathNodes.push(neighbor);
			currentPathEdges.push(edgeKey);

			dfs(neighbor, currentPathNodes, currentPathEdges);

			// 回溯
			currentPathNodes.pop();
			currentPathEdges.pop();
		}
	}

	// 从起点开始搜索
	dfs(source, [source], []);

	// 2. 收集所有成功抵达终点路径上的“功臣节点”
	const validNodes = new Set();
	successPaths.forEach((pathEdges) => {
		pathEdges.forEach((edge) => {
			const [u, v] = edge.split("->");
			validNodes.add(u);
			validNodes.add(v);
		});
	});

	// 3. 验证环路阶段 (秋后算账)
	let addedNewValidNodes = true;
	const validCyclePaths = [];
	const usedCycleIndices = new Set();

	// 使用 while 循环是因为：一个环路被验证成功后，它上面的节点可能又能验证其他的环路
	while (addedNewValidNodes) {
		addedNewValidNodes = false;

		for (let i = 0; i < cyclePaths.length; i++) {
			if (usedCycleIndices.has(i)) continue;

			const pathEdges = cyclePaths[i];
			// 拿到这条回头路的最后一步（例如 D -> B）
			const lastEdge = pathEdges[pathEdges.length - 1];
			const [_, v] = lastEdge.split("->"); // v 就是它回头指向的那个节点 (B)

			// 如果它回到的节点 B 是一个“功臣节点”，那这个环就是有意义的附属反馈环
			if (validNodes.has(v)) {
				validCyclePaths.push(pathEdges);
				usedCycleIndices.add(i);

				// 把这个环上的所有节点都加入功臣列表
				pathEdges.forEach((edge) => {
					const [nodeU, nodeV] = edge.split("->");
					if (!validNodes.has(nodeU)) {
						validNodes.add(nodeU);
						addedNewValidNodes = true;
					}
					if (!validNodes.has(nodeV)) {
						validNodes.add(nodeV);
						addedNewValidNodes = true;
					}
				});
			}
		}
	}

	// 4. 将验证过的边数组转换回 index.jsx 期望的节点数组格式
	const allValidEdgePaths = [...successPaths, ...validCyclePaths];

	const finalNodePaths = allValidEdgePaths.map((edgePath) => {
		const nodePath = [source];
		edgePath.forEach((edge) => {
			const [, v] = edge.split("->");
			nodePath.push(v);
		});
		return nodePath;
	});

	return finalNodePaths;
}
