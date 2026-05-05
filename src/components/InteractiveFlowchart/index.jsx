import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";
import { extractGraphFromSvg, findAllPaths } from "./graphUtils";
import "./styles.css";

let isMermaidInitialized = false;

const PATH_COLORS = [
	"#e63946",
	"#2a9d8f",
	"#e9c46a",
	"#f4a261",
	"#9b5de5",
	"#00bbf9",
	"#f15bb5",
	"#00f5d4",
	"#ff9f1c",
	"#8338ec",
];

export default function InteractiveFlowchart({ code, theme = "default" }) {
	const containerRef = useRef(null);
	const [graph, setGraph] = useState(null);
	const [selectedNodes, setSelectedNodes] = useState([]);
	const [error, setError] = useState(null);

	// 新增：用于跟踪当前系统/页面的主题状态
	const [currentTheme, setCurrentTheme] = useState(theme);

	// ==========================================
	// 监听全局亮暗色主题变化
	// ==========================================
	useEffect(() => {
		// 兼容 SSR：确保在浏览器环境下才访问 document
		if (typeof document === "undefined") return;

		const getThemeFromDOM = () => {
			const dataTheme =
				document.documentElement.getAttribute("mermaid-theme") ||
				document.body.getAttribute("mermaid-theme");
			return dataTheme === "dark" ? "dark" : theme;
		};

		// 挂载时初始化一次
		setCurrentTheme(getThemeFromDOM());

		// 使用 MutationObserver 监听 mermaid-theme 属性变化
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

				// 每次渲染前更新 Mermaid 的主题配置
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
	}, [code, currentTheme]); // 当 currentTheme 变化时，重新生成 SVG

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
	// 阶段三：视觉高亮渲染引擎
	// ==========================================
	useEffect(() => {
		if (!containerRef.current || !graph) return;
		const svgElement = containerRef.current.querySelector("svg");
		if (!svgElement) return;

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

			paths.forEach((pathNodes, pathIndex) => {
				const pathColor = PATH_COLORS[pathIndex % PATH_COLORS.length];

				pathNodes.forEach((nodeId) => {
					const nodeEl = svgElement.querySelector(
						`[id*="-flowchart-${nodeId}-"]`,
					);
					if (nodeEl) nodeEl.classList.add("highlight-node");
				});

				for (let i = 0; i < pathNodes.length - 1; i++) {
					const from = pathNodes[i];
					const to = pathNodes[i + 1];
					const edges = svgElement.querySelectorAll(
						`[data-id^="L_${from}_${to}_"]`,
					);
					edges.forEach((edgeEl) => {
						edgeEl.classList.add("highlight-edge");
						edgeEl.style.stroke = pathColor;
						edgeEl.style.strokeWidth = "3.5px";
					});
				}
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
