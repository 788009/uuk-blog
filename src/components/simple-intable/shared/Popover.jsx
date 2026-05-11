import React, { createContext, useContext, useEffect, useState } from "react";
import { usePopover } from "./usePopover";

// ==========================================
// 1. Theme System (Preserved as is for backward compatibility)
// ==========================================
const defaultPopoverTheme = {
	popoverPanel:
		"bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700",
	popoverAnimation: "transition-all duration-200",
	popoverOpen: "opacity-100 scale-100",
	popoverClosed: "opacity-0 scale-95 pointer-events-none",
	popoverTriggerFallback:
		"cursor-pointer focus:outline-none text-inherit inline-flex",
};

export const PopoverThemeContext = createContext({});

const useMergedTheme = (propsTheme = {}) => {
	const contextTheme = useContext(PopoverThemeContext);
	return { ...defaultPopoverTheme, ...contextTheme, ...propsTheme };
};

// ==========================================
// 2. State Context
// ==========================================
const PopoverStateContext = createContext(null);

// ==========================================
// 3. View Components
// ==========================================
export function Popover({ children, open, onOpenChange }) {
	// Offload bulky event and measurement logic into a specialized Hook
	const popoverState = usePopover({ open, onOpenChange });

	return (
		<PopoverStateContext.Provider value={popoverState}>
			<div className="relative inline-flex" ref={popoverState.containerRef}>
				{children}
			</div>
		</PopoverStateContext.Provider>
	);
}

export function PopoverTrigger({ children, theme: propsTheme = {} }) {
	const { isOpen, setOpen } = useContext(PopoverStateContext);
	const mergedTheme = useMergedTheme(propsTheme);

	if (React.isValidElement(children)) {
		return React.cloneElement(children, {
			onClick: (e) => {
				if (children.props.onClick) children.props.onClick(e);
				setOpen(!isOpen);
			},
		});
	}

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

export function PopoverContent({
	children,
	positionClass,
	theme: propsTheme = {},
}) {
	const { isOpen, rect, contentRef } = useContext(PopoverStateContext);
	const mergedTheme = useMergedTheme(propsTheme);
	const finalPos = positionClass || "top-full right-0 origin-top-right";

	// Animation control micro-states are kept within the component
	// because they are tightly coupled with DOM rendering
	const [shouldRender, setShouldRender] = useState(isOpen);
	const [isVisible, setIsVisible] = useState(isOpen);

	useEffect(() => {
		let timer;
		let frame1;
		let frame2;

		if (isOpen) {
			setShouldRender(true);
			frame1 = requestAnimationFrame(() => {
				frame2 = requestAnimationFrame(() => setIsVisible(true));
			});
		} else {
			setIsVisible(false);
			timer = setTimeout(() => setShouldRender(false), 200);
		}

		return () => {
			clearTimeout(timer);
			if (frame1) cancelAnimationFrame(frame1);
			if (frame2) cancelAnimationFrame(frame2);
		};
	}, [isOpen]);

	useEffect(() => {
		if (shouldRender && isOpen && contentRef.current) {
			try {
				if (!contentRef.current.matches(":popover-open")) {
					contentRef.current.showPopover();
				}
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
				color: "inherit",
				colorScheme: "inherit",
				position: "fixed",
				top: rect.top,
				left: rect.left,
				width: rect.width,
				height: rect.height,
				pointerEvents: "none",
				overflow: "visible",
			}}
		>
			<div
				className={`absolute pt-2 max-w-[calc(100vw-16px)] ${finalPos} ${mergedTheme.popoverAnimation} ${
					isVisible ? mergedTheme.popoverOpen : mergedTheme.popoverClosed
				}`}
				style={{ pointerEvents: isVisible ? "auto" : "none" }}
			>
				<div className={mergedTheme.popoverPanel}>{children}</div>
			</div>
		</div>
	);
}
