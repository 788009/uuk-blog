import { useEffect, useMemo, useRef, useState } from "react";
import "./timeline.css";

const DAY = 86_400_000;
const ROW_HEIGHT = 38;
const PALETTE = [
	"#d1495b",
	"#247ba0",
	"#2a9d6f",
	"#d97706",
	"#7c5cbf",
	"#c4458a",
	"#3b7a57",
];

function parseDate(value) {
	const [year, month, day] = value.split("-").map(Number);
	return Date.UTC(year, month - 1, day);
}

function formatDateLabel(value) {
	return value.split("-").map(Number).join(".");
}

function monthStart(timestamp) {
	const date = new Date(timestamp);
	return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

function addMonths(timestamp, amount) {
	const date = new Date(timestamp);
	return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1);
}

function positionInYear(timestamp, year, monthWidth) {
	const yearStart = Date.UTC(year, 0, 1);
	const yearEnd = Date.UTC(year + 1, 0, 1);
	if (timestamp <= yearStart) return 0;
	if (timestamp >= yearEnd) return 12 * monthWidth;
	const date = new Date(timestamp);
	const month = date.getUTCMonth();
	const start = Date.UTC(year, month, 1);
	const end = Date.UTC(year, month + 1, 1);
	return (month + (timestamp - start) / (end - start)) * monthWidth;
}

function prepareYearRows(items) {
	const firstYear = new Date(items[0].start).getUTCFullYear();
	const lastYear = new Date(items.at(-1).end - 1).getUTCFullYear();
	const years = [];

	for (let year = firstYear; year <= lastYear; year += 1) {
		const yearStart = Date.UTC(year, 0, 1);
		const yearEnd = Date.UTC(year + 1, 0, 1);
		const segments = items
			.filter((item) => item.start < yearEnd && item.end > yearStart)
			.map((item) => ({
				...item,
				segmentStart: Math.max(item.start, yearStart),
				segmentEnd: Math.min(item.end, yearEnd),
			}));

		const groupsMap = new Map();
		for (const segment of segments) {
			const key = `${segment.id}|${segment.name}`;
			if (!groupsMap.has(key)) groupsMap.set(key, []);
			groupsMap.get(key).push(segment);
		}
		const groups = Array.from(groupsMap.values());
		const rows = [];

		for (const group of groups) {
			let rowIndex = 0;
			while (true) {
				if (!rows[rowIndex]) rows[rowIndex] = [];
				const overlap = group.some((seg) =>
					rows[rowIndex].some(
						(placed) =>
							!(
								seg.segmentEnd - DAY <= placed.segmentStart ||
								seg.segmentStart >= placed.segmentEnd - DAY
							),
					),
				);
				if (!overlap) {
					for (const seg of group) {
						seg.tableRow = rowIndex;
						rows[rowIndex].push(seg);
					}
					break;
				}
				rowIndex += 1;
			}
		}

		for (const row of rows) {
			for (let i = 0; i < row.length; i++) {
				for (let j = 0; j < row.length; j++) {
					if (i !== j && row[i].end - DAY === row[j].start) {
						row[i].connectedRight = true;
						row[j].connectedLeft = true;
					}
				}
			}
			for (const seg of row) {
				const adjStart = seg.start + (seg.connectedLeft ? DAY / 2 : 0);
				const adjEnd = seg.end - (seg.connectedRight ? DAY / 2 : 0);
				seg.renderSegmentStart = Math.max(adjStart, yearStart);
				seg.renderSegmentEnd = Math.min(adjEnd, yearEnd);
			}
		}

		years.push({ year, segments, rowCount: Math.max(1, rows.length) });
	}

	return years;
}

function prepareItems(data) {
	const now = new Date();
	const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

	const rawItems = data
		.map((item) => {
			const finishDate = item.finishDate || todayStr;
			return {
				...item,
				finishDate,
				start: parseDate(item.startDate),
				end: parseDate(finishDate) + DAY,
			};
		})
		.sort((a, b) => a.start - b.start || a.end - b.end);

	const groupsMap = new Map();
	for (const item of rawItems) {
		const key = `${item.id}|${item.name}`;
		if (!groupsMap.has(key)) groupsMap.set(key, []);
		groupsMap.get(key).push(item);
	}
	const groups = Array.from(groupsMap.values());
	const rows = [];

	for (const group of groups) {
		let rowIndex = 0;
		while (true) {
			if (!rows[rowIndex]) rows[rowIndex] = [];
			const overlap = group.some((seg) =>
				rows[rowIndex].some(
					(placed) =>
						!(seg.end - DAY <= placed.start || seg.start >= placed.end - DAY),
				),
			);
			if (!overlap) {
				for (const seg of group) {
					seg.row = rowIndex;
					rows[rowIndex].push(seg);
				}
				break;
			}
			rowIndex += 1;
		}
	}

	for (const row of rows) {
		for (let i = 0; i < row.length; i++) {
			for (let j = 0; j < row.length; j++) {
				if (i !== j && row[i].end - DAY === row[j].start) {
					row[i].connectedRight = true;
					row[j].connectedLeft = true;
				}
			}
		}
	}

	const neighbours = groups.map(() => new Set());
	for (let i = 0; i < groups.length; i += 1) {
		for (let j = 0; j < i; j += 1) {
			const a = groups[i];
			const b = groups[j];
			const horizontal = a[0].row === b[0].row;
			let vertical = false;
			if (Math.abs(a[0].row - b[0].row) === 1) {
				vertical = a.some((segA) =>
					b.some((segB) => segA.start < segB.end && segB.start < segA.end),
				);
			}
			if (horizontal || vertical) {
				neighbours[i].add(j);
				neighbours[j].add(i);
			}
		}
	}

	const items = [];
	groups.forEach((group, index) => {
		const unavailable = new Set(
			[...neighbours[index]].map((other) => groups[other][0].color),
		);
		const color =
			PALETTE.find((c) => !unavailable.has(c)) ||
			PALETTE[index % PALETTE.length];
		for (const seg of group) {
			seg.color = color;
			items.push(seg);
		}
	});

	return {
		items: items.sort((a, b) => a.start - b.start || a.end - b.end),
		rowCount: rows.length,
	};
}

export default function GalgameTimeline({ dataUrl }) {
	const viewportRef = useRef(null);
	const [monthWidth, setMonthWidth] = useState(120);
	const [data, setData] = useState(null);
	const [error, setError] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		fetch(dataUrl, { signal: controller.signal })
			.then((response) => {
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				return response.json();
			})
			.then(setData)
			.catch((requestError) => {
				if (requestError.name !== "AbortError") setError(true);
			});
		return () => controller.abort();
	}, [dataUrl]);

	if (error)
		return <p className="galgame-timeline__status">时间轴数据加载失败。</p>;
	if (!data?.length)
		return <p className="galgame-timeline__status">正在加载时间轴...</p>;

	return (
		<TimelineContent
			data={data}
			viewportRef={viewportRef}
			monthWidth={monthWidth}
			setMonthWidth={setMonthWidth}
		/>
	);
}

function TimelineContent({ data, viewportRef, monthWidth, setMonthWidth }) {
	const [scaleInput, setScaleInput] = useState(String(monthWidth));
	const [layout, setLayout] = useState("table");
	const [activeItem, setActiveItem] = useState(null);
	const { items, rowCount } = useMemo(() => prepareItems(data), [data]);
	const yearRows = useMemo(() => prepareYearRows(items), [items]);
	const start = monthStart(items[0].start);
	const end = addMonths(monthStart(items.at(-1).end), 1);
	const totalDays = (end - start) / DAY;
	const averageMonthDays =
		totalDays / Math.round((end - start) / (DAY * 30.44));
	const pixelsPerDay = monthWidth / averageMonthDays;
	const width = totalDays * pixelsPerDay;
	const tableWidth = 58 + 12 * monthWidth;

	const months = [];
	for (let cursor = start; cursor < end; cursor = addMonths(cursor, 1)) {
		const date = new Date(cursor);
		const next = addMonths(cursor, 1);
		months.push({
			key: cursor,
			label: `${date.getUTCFullYear()}.${date.getUTCMonth() + 1}`,
			left: ((cursor - start) / DAY) * pixelsPerDay,
			width: ((next - cursor) / DAY) * pixelsPerDay,
		});
	}

	useEffect(() => {
		setScaleInput(String(monthWidth));
	}, [monthWidth]);

	function changeScale(nextWidth) {
		const viewport = viewportRef.current;
		if (!Number.isFinite(nextWidth) || nextWidth < 1) return;
		if (!viewport) return setMonthWidth(nextWidth);
		const currentWidth = layout === "single" ? width : tableWidth;
		const centerRatio =
			(viewport.scrollLeft + viewport.clientWidth / 2) / currentWidth;
		setMonthWidth(nextWidth);
		requestAnimationFrame(() => {
			const nextContentWidth =
				layout === "single"
					? totalDays * (nextWidth / averageMonthDays)
					: 58 + 12 * nextWidth;
			viewport.scrollLeft =
				centerRatio * nextContentWidth - viewport.clientWidth / 2;
		});
	}

	function changeScaleInput(event) {
		const value = event.target.value;
		setScaleInput(value);
		if (value !== "") changeScale(Number(value));
	}

	return (
		<section className="galgame-timeline" aria-label="Galgame 游玩时间轴">
			<div className="galgame-timeline__toolbar">
				<fieldset
					className="galgame-timeline__layout-switch"
					aria-label="时间轴排版"
				>
					<button
						type="button"
						className={layout === "table" ? "is-active" : ""}
						onClick={() => setLayout("table")}
					>
						表格
					</button>
					<button
						type="button"
						className={layout === "single" ? "is-active" : ""}
						onClick={() => setLayout("single")}
					>
						单行
					</button>
				</fieldset>
				<label htmlFor="galgame-timeline-scale">时间轴尺度</label>
				{/* biome-ignore lint/correctness/useUniqueElementIds: reason */}
				<input
					id="galgame-timeline-scale"
					type="range"
					min="70"
					max="500"
					step="5"
					value={monthWidth}
					onChange={(event) => changeScale(Number(event.target.value))}
				/>
				<div className="galgame-timeline__scale-input">
					<input
						type="number"
						min="1"
						step="1"
						value={scaleInput}
						onChange={changeScaleInput}
						onBlur={() => setScaleInput(String(monthWidth))}
						aria-label="每月像素宽度"
					/>
					<span>px/月</span>
				</div>
				<div
					className={`galgame-timeline__detail${activeItem ? " is-visible" : ""}`}
					aria-live="polite"
				>
					{activeItem && (
						<>
							<span
								className="galgame-timeline__detail-color"
								style={{ backgroundColor: activeItem.color }}
							/>
							<strong>{activeItem.name}</strong>
							<span className="galgame-timeline__detail-date">
								{formatDateLabel(activeItem.startDate)}–
								{formatDateLabel(activeItem.finishDate)}
							</span>
						</>
					)}
				</div>
			</div>
			<div className="galgame-timeline__viewport" ref={viewportRef}>
				{layout === "single" ? (
					<div
						className="galgame-timeline__canvas"
						style={{ width, height: 45 + rowCount * ROW_HEIGHT }}
					>
						<div className="galgame-timeline__axis">
							{months.map((month) => (
								<div
									className="galgame-timeline__month"
									key={month.key}
									style={{ left: month.left, width: month.width }}
								>
									{month.label}
								</div>
							))}
						</div>
						<div
							className="galgame-timeline__rows"
							style={{ height: rowCount * ROW_HEIGHT }}
						>
							{months.map((month) => (
								<span
									className="galgame-timeline__gridline"
									key={month.key}
									style={{ left: month.left }}
								/>
							))}
							{items.map((item) => {
								const adjStart = item.start + (item.connectedLeft ? DAY / 2 : 0);
								const adjEnd = item.end - (item.connectedRight ? DAY / 2 : 0);
								return (
									<a
										className="no-styling galgame-timeline__item"
										href={`#${encodeURIComponent(item.id)}`}
										key={`${item.id}-${item.startDate}`}
										style={{
											left: ((adjStart - start) / DAY) * pixelsPerDay,
											width: Math.max(
												((adjEnd - adjStart) / DAY) * pixelsPerDay,
												2,
											),
											top: item.row * ROW_HEIGHT + 5,
											backgroundColor: item.color,
											borderTopLeftRadius: item.connectedLeft ? 0 : undefined,
											borderBottomLeftRadius: item.connectedLeft ? 0 : undefined,
											borderTopRightRadius: item.connectedRight ? 0 : undefined,
											borderBottomRightRadius: item.connectedRight ? 0 : undefined,
										}}
										onMouseEnter={() => setActiveItem(item)}
										onMouseLeave={() => setActiveItem(null)}
										onFocus={() => setActiveItem(item)}
										onBlur={() => setActiveItem(null)}
									>
										<span>{item.name}</span>
									</a>
								);
							})}
						</div>
					</div>
				) : (
					<div
						className="galgame-timeline__table"
						style={{ width: tableWidth }}
					>
						<div className="galgame-timeline__table-head">
							<div className="galgame-timeline__year-head">年份</div>
							{Array.from({ length: 12 }, (_, month) => (
								<div
									className="galgame-timeline__table-month"
									// biome-ignore lint/suspicious/noArrayIndexKey: reason
									key={month}
									style={{ left: 58 + month * monthWidth, width: monthWidth }}
								>
									{month + 1} 月
								</div>
							))}
						</div>
						{yearRows.map(({ year, segments, rowCount: tableRowCount }) => (
							<div
								className="galgame-timeline__year-row"
								key={year}
								style={{ height: tableRowCount * ROW_HEIGHT }}
							>
								<div className="galgame-timeline__year-label">{year}</div>
								{Array.from({ length: 13 }, (_, month) => (
									<span
										className="galgame-timeline__table-gridline"
										// biome-ignore lint/suspicious/noArrayIndexKey: reason
										key={month}
										style={{ left: 58 + month * monthWidth }}
									/>
								))}
								{segments.map((item) => {
									const left = positionInYear(
										item.renderSegmentStart,
										year,
										monthWidth,
									);
									const right = positionInYear(
										item.renderSegmentEnd,
										year,
										monthWidth,
									);
									return (
										<a
											className="no-styling galgame-timeline__item"
											href={`#${encodeURIComponent(item.id)}`}
											key={`${item.id}-${year}`}
											style={{
												left: 58 + left,
												width: Math.max(right - left, 2),
												top: item.tableRow * ROW_HEIGHT + 5,
												backgroundColor: item.color,
												borderTopLeftRadius: item.connectedLeft ? 0 : undefined,
												borderBottomLeftRadius: item.connectedLeft ? 0 : undefined,
												borderTopRightRadius: item.connectedRight ? 0 : undefined,
												borderBottomRightRadius: item.connectedRight ? 0 : undefined,
											}}
											onMouseEnter={() => setActiveItem(item)}
											onMouseLeave={() => setActiveItem(null)}
											onFocus={() => setActiveItem(item)}
											onBlur={() => setActiveItem(null)}
										>
											<span>{item.name}</span>
										</a>
									);
								})}
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
