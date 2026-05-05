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
	// 阶段三：视觉高亮渲染引擎 (主干优先的连续流淌着色)
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

			// 批量点亮所有途径的节点
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

			// 主干优先排序
			// 将所有路径分为“直达终点的主干”和“兜圈子的环路”
			const targetPaths = paths.filter((p) => p[p.length - 1] === target);
			const cyclePaths = paths.filter((p) => p[p.length - 1] !== target);

			// 按长度升序排序：越短的直线路径优先级越高，它是当之无愧的第一主干
			targetPaths.sort((a, b) => a.length - b.length);
			cyclePaths.sort((a, b) => a.length - b.length);

			const sortedPaths = [...targetPaths, ...cyclePaths];

			// 流淌着色引擎
			const edgeColors = {};
			const usedColorsAtNode = {}; // 账本：记录每个节点向外发出过哪些颜色
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
						// 1. 遇到已经被前置主干道上过色的边 -> 搭便车，顺应主干的颜色
						currentPathColor = edgeColors[edgePrefix];
					} else {
						// 2. 遇到未着色的新边
						if (!currentPathColor) {
							currentPathColor = getNextColor(); // 赋予全新的源头颜色
						}

						// 3. 这个节点 u 之前有没有流出过这个颜色？
						if (usedColorsAtNode[u].has(currentPathColor)) {
							// 如果流出过，这说明当前路径是在这里发生的分叉（岔路），强制脱离原色
							currentPathColor = getNextColor();
						}

						// 上色并记账
						edgeColors[edgePrefix] = currentPathColor;
						usedColorsAtNode[u].add(currentPathColor);
					}
				}
			});

			// 将计算好的颜色字典映射到 SVG DOM 元素上
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
