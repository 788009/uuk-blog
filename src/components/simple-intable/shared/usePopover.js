import { useState, useCallback, useRef, useEffect } from "react";

export function usePopover({ open, onOpenChange }) {
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
	const contentRef = useRef(null);
	const [rect, setRect] = useState(null);

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
		updateRect();
		if (isOpen) {
			window.addEventListener("resize", updateRect);
			window.addEventListener("scroll", updateRect, true); // capture: true
		}
		return () => {
			window.removeEventListener("resize", updateRect);
			window.removeEventListener("scroll", updateRect, true);
		};
	}, [isOpen, updateRect]);

	return { isOpen, setOpen, rect, containerRef, contentRef };
}
