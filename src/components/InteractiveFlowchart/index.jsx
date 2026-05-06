import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";
import { extractGraphFromSvg, findAllPaths } from "./graphUtils";
import "./styles.css";

let isMermaidInitialized = false;

const PATH_COLORS = [
	"#e63946", // 红色 (Imperial Red)
	"#2a9d8f", // 鸭蛋绿 (Persian Green)
	"#e9c46a", // 黄色 (Saffron)
	"#f4a261", // 橙沙 (Sandy Brown)
	"#9b5de5", // 紫罗兰 (Amethyst)
	"#00bbf9", // 天蓝 (Capri)
	"#f15bb5", // 桃红 (Hot Pink)
	"#12d4a6", // 翠绿 (Light Green)
	"#ff9f1c", // 橙色 (Orange)
	"#8338ec", // 深紫 (Blue Violet)
	"#38b000", // 草地绿 (Apple Green)
	"#ff006e", // 玫瑰红 (Rose)
	"#3a86ff", // 皇家蓝 (Azure)
	"#ffbe0b", // 金黄 (Amber)
	"#fb5607", // 橙红 (Orange Red)
	"#4361ee", // 靛蓝 (Palatinate Blue)
	"#20b2aa", // 浅海洋绿 (Light Sea Green)
	"#f94144", // 番茄红 (Tomato)
	"#7209b7", // 深葡萄紫 (Grape)
	"#0077b6", // 海洋蓝 (Star Command Blue)
];

export default function InteractiveFlowchart({ code, theme = "default" }) {
	const containerRef = useRef(null);
	const [graph, setGraph] = useState(null);
	// 状态数组结构：[起点, 终点, 途经点1, 途经点2, ...]
	const [selectedNodes, setSelectedNodes] = useState([]);
	const [error, setError] = useState(null);
	const [currentTheme, setCurrentTheme] = useState(theme);

	// ==========================================
	// 监听全局亮暗色主题变化
	// ==========================================
	useEffect(() => {
		if (typeof document === "undefined") return;

		const getThemeFromDOM = () => {
			const dataTheme =
				document.documentElement.getAttribute("page-theme") ||
				document.body.getAttribute("page-theme");
			return dataTheme === "dark" ? "dark" : theme;
		};

		setCurrentTheme(getThemeFromDOM());

		const observer = new MutationObserver((mutations) => {
			const hasThemeChange = mutations.some(
				(m) => m.type === "attributes" && m.attributeName === "page-theme",
			);
			if (hasThemeChange) {
				setCurrentTheme(getThemeFromDOM());
			}
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["page-theme"],
		});
		observer.observe(document.body, {
			attributes: true,
			attributeFilter: ["page-theme"],
		});

		return () => observer.disconnect();
	}, [theme]);

	// ==========================================
	// 阶段一：初始化与渲染 Mermaid
	// ==========================================
	useEffect(() => {
		const renderChart = async () => {
			try {
				if (!isMermaidInitialized) {
					try {
						const elk = await import("@mermaid-js/layout-elk");
						mermaid.registerLayoutLoaders(elk.default);
					} catch (_e) {
						console.warn("ELK layout not found, fallback to default.");
					}
					isMermaidInitialized = true;
				}

				mermaid.initialize({ startOnLoad: false, theme: currentTheme });

				const id = `mermaid-interactive-${Math.random().toString(36).substring(2, 11)}`;
				const cleanCode = code.trim();
				const { svg } = await mermaid.render(id, cleanCode);

				if (containerRef.current) {
					containerRef.current.innerHTML = svg;
					const adjacencyList = extractGraphFromSvg(containerRef.current);
					setGraph(adjacencyList);
				}
			} catch (err) {
				console.error("Mermaid parsing error:", err);
				setError(err.message);
			}
		};

		renderChart();
	}, [code, currentTheme]);

	// ==========================================
	// 阶段二：事件代理与状态机管理
	// ==========================================
	useEffect(() => {
		if (!graph || !containerRef.current) return;
		const svgElement = containerRef.current.querySelector("svg");
		if (!svgElement) return;

		svgElement.classList.add("interactive-mermaid");

		const handleSvgClick = (e) => {
			const nodeElement = e.target.closest(".node");

			// 点击空白处，自动取消选中所有节点
			if (!nodeElement) {
				setSelectedNodes([]);
				return;
			}

			// 在变暗状态下，如果点中的节点不是高亮节点（即点中了暗掉的死胡同节点），等同于点击空白处
			if (
				svgElement.classList.contains("is-dimming") &&
				!nodeElement.classList.contains("highlight-node")
			) {
				setSelectedNodes([]);
				return;
			}

			const idAttr = nodeElement.getAttribute("id");
			const match = idAttr?.match(/-flowchart-(.+)-\d+$/);
			if (!match) return;

			const nodeId = match[1];

			setSelectedNodes((prev) => {
				if (prev.length === 0) return [nodeId];

				if (prev.length === 1) {
					// 若此时取消选中第一个节点，则自动取消选中所有节点
					if (prev[0] === nodeId) return [];
					return [prev[0], nodeId];
				}

				if (prev.length >= 2) {
					// 若此时取消选中第一个节点，则自动取消选中所有节点
					if (nodeId === prev[0]) return [];
					// 若此时取消选中第二个节点，则自动取消选中除了第一个节点之外的所有节点
					if (nodeId === prev[1]) return [prev[0]];

					// 对于第三个及以上的节点 (途经点) 的切换逻辑
					if (prev.includes(nodeId)) {
						// 如果已经选中了，再次点击则取消选中该途经点
						return prev.filter((id) => id !== nodeId);
					}
					// 否则加入途经点列表
					return [...prev, nodeId];
				}
				return prev;
			});
		};

		svgElement.addEventListener("click", handleSvgClick);
		return () => svgElement.removeEventListener("click", handleSvgClick);
	}, [graph]);

	// ==========================================
	// 阶段三：视觉高亮渲染引擎
	// ==========================================
	useEffect(() => {
		if (!containerRef.current || !graph) return;
		const svgElement = containerRef.current.querySelector("svg");
		if (!svgElement) return;

		// 1. 清理上一帧的样式
		svgElement.classList.remove("has-selection", "is-dimming");
		svgElement.querySelectorAll(".node").forEach((node) => {
			node.classList.remove(
				"highlight-node",
				"selected-node",
				"source-node",
				"target-node",
				"waypoint-node",
			);
		});
		svgElement.querySelectorAll(".edgePaths path").forEach((path) => {
			path.classList.remove("highlight-edge");
			path.style.stroke = "";
			path.style.strokeWidth = "";
		});

		if (selectedNodes.length === 0) return;
		svgElement.classList.add("has-selection");

		// 2. 控制全局变暗 (仅限选中 2 个及以上节点时)
		if (selectedNodes.length >= 2) {
			svgElement.classList.add("is-dimming");
		}

		// 3. 标记选中的节点
		selectedNodes.forEach((nodeId, index) => {
			const nodeEl = svgElement.querySelector(`[id*="-flowchart-${nodeId}-"]`);
			if (nodeEl) {
				nodeEl.classList.add("selected-node", "highlight-node");
				if (index === 0) nodeEl.classList.add("source-node");
				else if (index === 1) nodeEl.classList.add("target-node");
				else nodeEl.classList.add("waypoint-node");
			}
		});

		// 4. 仅选中 1 个节点时的出入边高亮逻辑
		if (selectedNodes.length === 1) {
			const centerNode = selectedNodes[0];

			// 查找并高亮出边 (Outgoing) - 使用深粉红色 (#e63946)
			const outgoingNodes = graph[centerNode] || [];
			outgoingNodes.forEach((target) => {
				const edges = svgElement.querySelectorAll(
					`[data-id^="L_${centerNode}_${target}_"]`,
				);
				edges.forEach((edgeEl) => {
					edgeEl.classList.add("highlight-edge");
					edgeEl.style.stroke = "#e63946";
					edgeEl.style.strokeWidth = "3.5px";
				});
			});

			// 查找并高亮入边 (Incoming) - 使用天蓝 (#00bbf9)
			Object.keys(graph).forEach((source) => {
				if (graph[source].includes(centerNode)) {
					const edges = svgElement.querySelectorAll(
						`[data-id^="L_${source}_${centerNode}_"]`,
					);
					edges.forEach((edgeEl) => {
						edgeEl.classList.add("highlight-edge");
						edgeEl.style.stroke = "#00bbf9";
						edgeEl.style.strokeWidth = "3.5px";
					});
				}
			});
			return; // 结束渲染，不执行下方的寻路逻辑
		}

		// 5. 选中 2 个及以上节点时的完整寻路渲染逻辑
		if (selectedNodes.length >= 2) {
			const source = selectedNodes[0];
			const target = selectedNodes[1];
			const waypoints = selectedNodes.slice(2);

			// 算出所有抵达终点的潜在路径
			const allPaths = findAllPaths(graph, source, target);

			// 过滤路径池，只有同时包含所有“途经点”的路径才能幸存
			const paths = allPaths.filter((pathNodes) => {
				return waypoints.every((wp) => pathNodes.includes(wp));
			});

			if (paths.length === 0) return;

			const validNodes = new Set();
			paths.forEach((pathNodes) => {
				pathNodes.forEach((n) => {
					validNodes.add(n);
				});
			});
			validNodes.forEach((nodeId) => {
				const nodeEl = svgElement.querySelector(
					`[id*="-flowchart-${nodeId}-"]`,
				);
				if (nodeEl) nodeEl.classList.add("highlight-node");
			});

			const sortedPaths = [...paths].sort((a, b) => a.length - b.length);

			// 连续流淌着色引擎
			const edgeColors = {};
			const usedColorsAtNode = {};
			let colorIndex = 0;
			const getNextColor = () => PATH_COLORS[colorIndex++ % PATH_COLORS.length];

			sortedPaths.forEach((pathNodes) => {
				let currentPathColor = null;

				for (let i = 0; i < pathNodes.length - 1; i++) {
					const u = pathNodes[i];
					const v = pathNodes[i + 1];
					const edgePrefix = `L_${u}_${v}`;

					if (!usedColorsAtNode[u]) usedColorsAtNode[u] = new Set();

					if (edgeColors[edgePrefix]) {
						currentPathColor = edgeColors[edgePrefix]; // 搭便车
					} else {
						if (!currentPathColor) {
							currentPathColor = getNextColor();
						}
						if (usedColorsAtNode[u].has(currentPathColor)) {
							currentPathColor = getNextColor(); // 发生分叉，换新色
						}

						edgeColors[edgePrefix] = currentPathColor;
						usedColorsAtNode[u].add(currentPathColor);
					}
				}
			});

			// 将颜色渲染到 SVG 连线
			Object.keys(edgeColors).forEach((edgePrefix) => {
				const color = edgeColors[edgePrefix];
				const edges = svgElement.querySelectorAll(
					`[data-id^="${edgePrefix}_"]`,
				);
				edges.forEach((edgeEl) => {
					edgeEl.classList.add("highlight-edge");
					edgeEl.style.stroke = color;
					edgeEl.style.strokeWidth = "3.5px";
				});
			});
		}
	}, [selectedNodes, graph]);

	if (error) {
		return (
			<div className="text-red-500 border p-4">
				Mermaid Render Error: {error}
			</div>
		);
	}

	return <div className="interactive-mermaid-container" ref={containerRef} />;
}
