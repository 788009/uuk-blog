import { useCallback, useEffect, useRef, useState } from "react";

export function usePopover({ open, onOpenChange }) {
	const [isOpenUncontrolled, setIsOpenUncontrolled] = useState(false);

	// Support both external Controlled and internal Uncontrolled modes
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

	// Calculate the trigger's absolute coordinates relative to the viewport
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

	// Core Logic 1: Auto-close on outside click (considering Portals)
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

	// Core Logic 2: Support closing with the Escape key
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

	// Core Logic 3: Position synchronization engine
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
