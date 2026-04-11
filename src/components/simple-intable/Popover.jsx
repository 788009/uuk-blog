// src/components/Popover.jsx

import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

// ==========================================
// 1. 主题与样式系统 (Theme & Styles)
// ==========================================

// Popover 的自带默认样式
const defaultPopoverTheme = {
	popoverPanel:
		"bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700",
	popoverAnimation: "transition-all duration-200",
	popoverOpen: "opacity-100 scale-100",
	popoverClosed: "opacity-0 scale-95 pointer-events-none",

	// ====== 为纯文本触发器准备的后备按钮样式 ======
	// 仅保留必需的交互样式，依赖 Tailwind 默认重置
	popoverTriggerFallback:
		"cursor-pointer focus:outline-none text-inherit inline-flex",
};

// 暴露 Context 供外部系统（如 InteractiveTable）跨层级注入样式
export const PopoverThemeContext = createContext({});

// 自定义 Hook：解析最终合并的主题样式
// 优先级: Props 主动覆盖 > Context 继承环境样式 > Popover 默认样式
const useMergedTheme = (propsTheme = {}) => {
	const contextTheme = useContext(PopoverThemeContext);
	return { ...defaultPopoverTheme, ...contextTheme, ...propsTheme };
};

// ==========================================
// 2. 状态管理系统 (State Context)
// ==========================================
const PopoverStateContext = createContext(null);

// ==========================================
// 3. 复合组件实现 (Compound Components)
// ==========================================

/**
 * Popover 根容器：负责状态流转、受控状态兼容和点击外部关闭的底层交互
 */
export function Popover({ children, open, onOpenChange }) {
	const [isOpenUncontrolled, setIsOpenUncontrolled] = useState(false);

	// 兼容外部受控模式 (Controlled) 与内部非受控模式 (Uncontrolled)
	const isControlled = open !== undefined;
	const isOpen = isControlled ? open : isOpenUncontrolled;

	const setOpen = useCallback(
		(val) => {
			if (!isControlled) setIsOpenUncontrolled(val);
			if (onOpenChange) onOpenChange(val);
		},
		[isControlled, onOpenChange],
	);

	const containerRef = useRef(null);
	const contentRef = useRef(null); // 新增：用于识别 Portal 内部的点击
	const [rect, setRect] = useState(null); // 新增：记录触发器的屏幕位置

	// 计算触发器在整个文档中的绝对坐标
	const updateRect = useCallback(() => {
		if (containerRef.current) {
			const domRect = containerRef.current.getBoundingClientRect();
			setRect({
				top: domRect.top,
				left: domRect.left,
				width: domRect.width,
				height: domRect.height,
			});
		}
	}, []);

	// 核心逻辑 1：点击外部自动关闭（兼顾 Portal）
	useEffect(() => {
		const handleClickOutside = (e) => {
			// 因为内容被 Portal 传送到 body 底部了，必须同时检查点击是否发生在触发器或内容面板内
			const isClickTrigger = containerRef.current?.contains(e.target);
			const isClickContent = contentRef.current?.contains(e.target);

			if (!isClickTrigger && !isClickContent) {
				setOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("click", handleClickOutside);
		}
		return () => document.removeEventListener("click", handleClickOutside);
	}, [isOpen, setOpen]);

	// 核心逻辑 2：支持 Esc 键关闭
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				setOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
		}
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, setOpen]);

	// 核心逻辑 3：位置同步引擎
	useEffect(() => {
		updateRect(); // 初始化时计算一次
		if (isOpen) {
			window.addEventListener("resize", updateRect);
			// 必须开启 capture 捕获阶段 (true)，这样表格内部的水平滚动也能触发位置更新
			window.addEventListener("scroll", updateRect, true);
		}
		return () => {
			window.removeEventListener("resize", updateRect);
			window.removeEventListener("scroll", updateRect, true);
		};
	}, [isOpen, updateRect]);

	return (
		<PopoverStateContext.Provider value={{ isOpen, setOpen, rect, contentRef }}>
			<div className="relative inline-flex" ref={containerRef}>
				{children}
			</div>
		</PopoverStateContext.Provider>
	);
}

/**
 * 触发器：克隆并劫持子元素的 onClick 事件，避免额外生成 DOM 节点破坏外部 Flex 布局
 */
// Popover.jsx 中的 Trigger 组件
export function PopoverTrigger({ children, theme: propsTheme = {} }) {
	const { isOpen, setOpen } = useContext(PopoverStateContext);
	const mergedTheme = useMergedTheme(propsTheme); // 接入主题系统

	if (React.isValidElement(children)) {
		return React.cloneElement(children, {
			onClick: (e) => {
				if (children.props.onClick) {
					children.props.onClick(e);
				}
				setOpen(!isOpen);
			},
		});
	}

	// 遵守无障碍标准：使用 button 代替 span
	return (
		<button
			type="button"
			onClick={() => setOpen(!isOpen)}
			className={mergedTheme.popoverTriggerFallback}
		>
			{children}
		</button>
	);
}

/**
 * 内容面板：负责渲染弹窗本身，处理动画和挂载位置
 */
export function PopoverContent({
	children,
	positionClass,
	theme: propsTheme = {},
}) {
	const { isOpen, rect, contentRef } = useContext(PopoverStateContext);
	const mergedTheme = useMergedTheme(propsTheme);

	const finalPos = positionClass || "top-full right-0 origin-top-right";

	// 拆分两个状态：shouldRender 控制物理 DOM 的存在，isVisible 控制 CSS 动画表现
	const [shouldRender, setShouldRender] = useState(isOpen);
	const [isVisible, setIsVisible] = useState(isOpen);

	// 1. 状态与卸载同步逻辑（完美复原入场与出场动画）
	useEffect(() => {
		let timer;
		let frame1;
		let frame2;

		if (isOpen) {
			setShouldRender(true); // 第一步：把 DOM 塞进页面，此时 isVisible 仍是 false，状态为关闭（opacity-0）

			// 利用双重 requestAnimationFrame 强制浏览器渲染一帧关闭状态，
			// 然后再触发 isVisible = true，这样浏览器就能完美演算出透明度过渡动画。
			frame1 = requestAnimationFrame(() => {
				frame2 = requestAnimationFrame(() => {
					setIsVisible(true);
				});
			});
		} else {
			setIsVisible(false); // 第一步：触发 CSS 出场动画
			timer = setTimeout(() => {
				setShouldRender(false); // 第二步：动画播完后销毁 DOM
			}, 200);
		}

		return () => {
			clearTimeout(timer);
			if (frame1) cancelAnimationFrame(frame1);
			if (frame2) cancelAnimationFrame(frame2);
		};
	}, [isOpen]);

	// 2. 调度原生 Top Layer API
	useEffect(() => {
		if (shouldRender && isOpen && contentRef.current) {
			try {
				if (!contentRef.current.matches(":popover-open")) {
					contentRef.current.showPopover();
				}
				_e;
			} catch (_e) {
				console.warn("Browser fallback");
			}
		}
	}, [shouldRender, isOpen, contentRef]);

	if (!rect || !shouldRender) return null;

	return (
		<div
			ref={contentRef}
			popover="manual"
			style={{
				margin: 0,
				padding: 0,
				border: "none",
				background: "transparent",
				// ======= 强制重置 UA 样式 =======
				color: "inherit", // 1. 强制继承父级文字颜色，覆盖 CanvasText
				colorScheme: "inherit", // 2. 强制继承父级配色方案（light/dark）
				// ===============================
				position: "fixed",
				top: rect.top,
				left: rect.left,
				width: rect.width,
				height: rect.height,

				// 将外壳的点击响应设为 none！
				// 这样透明的外壳就不会挡住下面原按钮的点击事件，再次点击按钮即可关闭。
				pointerEvents: "none",
				overflow: "visible",
			}}
		>
			<div
				className={`absolute pt-2 max-w-[calc(100vw-16px)] ${finalPos} ${mergedTheme.popoverAnimation} ${
					isVisible ? mergedTheme.popoverOpen : mergedTheme.popoverClosed
				}`}
				// 因为外壳禁用了点击，我们需要给弹出层本身单独开通点击权限，否则菜单里的按钮也会失效
				style={{ pointerEvents: isVisible ? "auto" : "none" }}
			>
				<div className={mergedTheme.popoverPanel}>{children}</div>
			</div>
		</div>
	);
}
