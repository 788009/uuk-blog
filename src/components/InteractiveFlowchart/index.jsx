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
				document.documentElement.getAttribute("mermaid-theme") ||
				document.body.getAttribute("mermaid-theme");
			return dataTheme === "dark" ? "dark" : theme;
		};

		setCurrentTheme(getThemeFromDOM());

		const observer = new MutationObserver((mutations) => {
			const hasThemeChange = mutations.some(
				(m) => m.type === "attributes" && m.attributeName === "mermaid-theme",
			);
			if (hasThemeChange) {
				setCurrentTheme(getThemeFromDOM());
			}
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["mermaid-theme"],
		});
		observer.observe(document.body, {
			attributes: true,
			attributeFilter: ["mermaid-theme"],
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

			if (!nodeElement) {
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
					if (prev[0] === nodeId) return [];
					return [prev[0], nodeId];
				}
				if (prev.length === 2) {
					if (nodeId === prev[0]) return [prev[1]];
					if (nodeId === prev[1]) return [prev[0]];
					return [prev[0], nodeId];
				}
				return prev;
			});
		};

		svgElement.addEventListener("click", handleSvgClick);
		return () => svgElement.removeEventListener("click", handleSvgClick);
	}, [graph]);

	// ==========================================
	// 阶段三：视觉高亮渲染引擎 (全新拓扑生长树着色)
	// ==========================================
	useEffect(() => {
		if (!containerRef.current || !graph) return;
		const svgElement = containerRef.current.querySelector("svg");
		if (!svgElement) return;

		// 1. 清理上一帧的样式
		svgElement.classList.remove("has-selection");
		svgElement.querySelectorAll(".node").forEach((node) => {
			node.classList.remove(
				"highlight-node",
				"selected-node",
				"source-node",
				"target-node",
			);
		});
		svgElement.querySelectorAll(".edgePaths path").forEach((path) => {
			path.classList.remove("highlight-edge");
			path.style.stroke = "";
			path.style.strokeWidth = "";
		});

		if (selectedNodes.length === 0) return;
		svgElement.classList.add("has-selection");

		selectedNodes.forEach((nodeId, index) => {
			const nodeEl = svgElement.querySelector(`[id*="-flowchart-${nodeId}-"]`);
			if (nodeEl) {
				nodeEl.classList.add("selected-node", "highlight-node");
				if (index === 0) nodeEl.classList.add("source-node");
				if (index === 1) nodeEl.classList.add("target-node");
			}
		});

		if (selectedNodes.length === 2) {
			const [source, target] = selectedNodes;
			const paths = findAllPaths(graph, source, target);

			if (paths.length === 0) return;

			// 1. 从所有路线中提取出一个“有效连线子网 (Adjacency List)”
			const validAdj = {};
			const validNodes = new Set();
			paths.forEach((pathNodes) => {
				pathNodes.forEach((n) => {
					validNodes.add(n);
				});
				for (let i = 0; i < pathNodes.length - 1; i++) {
					const u = pathNodes[i];
					const v = pathNodes[i + 1];
					if (!validAdj[u]) validAdj[u] = new Set();
					validAdj[u].add(v);
				}
			});

			// 批量点亮途径的节点
			validNodes.forEach((nodeId) => {
				const nodeEl = svgElement.querySelector(
					`[id*="-flowchart-${nodeId}-"]`,
				);
				if (nodeEl) nodeEl.classList.add("highlight-node");
			});

			// 2. BFS 拓扑生长着色引擎
			const edgeColors = {};
			const nodeIncomingColor = {}; // 记录每个节点被注入的颜色
			let colorIndex = 0;
			const getNextColor = () => PATH_COLORS[colorIndex++ % PATH_COLORS.length];

			nodeIncomingColor[source] = getNextColor(); // 给起点注入第一种颜色
			const queue = [source];
			const visited = new Set([source]);

			while (queue.length > 0) {
				const u = queue.shift();
				const neighbors = Array.from(validAdj[u] || []);

				if (neighbors.length === 0) continue;

				// 拿到当前节点的基础颜色（即上一级传下来的颜色）
				const baseColor = nodeIncomingColor[u];

				// 核心逻辑：遍历它的所有发出的连线
				neighbors.forEach((v, index) => {
					const edgeKey = `L_${u}_${v}`;

					// 只有未被着色的边才处理
					if (!edgeColors[edgeKey]) {
						// 技巧：第一条支路继承干道的颜色，其他的支路强制获取新颜色！
						const assignedColor = index === 0 ? baseColor : getNextColor();
						edgeColors[edgeKey] = assignedColor;

						// 将颜色传递给下一个节点（如果它还没有收到过颜色的话）
						if (!nodeIncomingColor[v]) {
							nodeIncomingColor[v] = assignedColor;
						}

						// 继续往下生长
						if (!visited.has(v)) {
							visited.add(v);
							queue.push(v);
						}
					}
				});
			}

			// 3. 将计算好的边颜色实际应用到 DOM 上
			Object.keys(edgeColors).forEach((edgeKey) => {
				const color = edgeColors[edgeKey];
				// 查找对应的 SVG Path 元素
				const edges = svgElement.querySelectorAll(`[data-id^="${edgeKey}_"]`);
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
