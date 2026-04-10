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

	// 核心逻辑 1：点击外部自动关闭
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
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

	return (
		<PopoverStateContext.Provider value={{ isOpen, setOpen }}>
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
	const { isOpen } = useContext(PopoverStateContext);
	const mergedTheme = useMergedTheme(propsTheme);

	// 默认提供右下挂载，也可通过 positionClass 进行精细微调覆盖
	const finalPos = positionClass || "top-full right-0 origin-top-right";

	return (
		<div
			className={`absolute z-[50] pt-2 ${finalPos} ${mergedTheme.popoverAnimation} ${
				isOpen ? mergedTheme.popoverOpen : mergedTheme.popoverClosed
			}`}
		>
			{/* 承载面板底色、阴影与边框的核心层 */}
			<div className={mergedTheme.popoverPanel}>{children}</div>
		</div>
	);
}
