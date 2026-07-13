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
		const rowEnds = [];
		for (const segment of segments) {
			let row = rowEnds.findIndex((end) => end <= segment.segmentStart);
			if (row < 0) row = rowEnds.length;
			segment.tableRow = row;
			rowEnds[row] = segment.segmentEnd;
		}
		years.push({ year, segments, rowCount: Math.max(1, rowEnds.length) });
	}

	return years;
}

function prepareItems(data) {
	const items = data
		.map((item) => ({
			...item,
			start: parseDate(item.startDate),
			end: parseDate(item.finishDate) + DAY,
		}))
		.sort((a, b) => a.start - b.start || a.end - b.end);

	const rowEnds = [];
	for (const item of items) {
		let row = rowEnds.findIndex((end) => end <= item.start);
		if (row < 0) row = rowEnds.length;
		item.row = row;
		rowEnds[row] = item.end;
	}

	// Build adjacency from horizontal neighbours and vertically overlapping bars.
	const neighbours = items.map(() => new Set());
	for (let i = 0; i < items.length; i += 1) {
		for (let j = 0; j < i; j += 1) {
			const a = items[i];
			const b = items[j];
			const horizontal = a.row === b.row;
			const vertical =
				Math.abs(a.row - b.row) === 1 && a.start < b.end && b.start < a.end;
			if (horizontal || vertical) {
				neighbours[i].add(j);
				neighbours[j].add(i);
			}
		}
	}

	items.forEach((item, index) => {
		const unavailable = new Set(
			[...neighbours[index]].map((other) => items[other].color),
		);
		item.color =
			PALETTE.find((color) => !unavailable.has(color)) ||
			PALETTE[index % PALETTE.length];
	});

	return { items, rowCount: rowEnds.length };
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
	const [layout, setLayout] = useState("single");
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
						className={layout === "single" ? "is-active" : ""}
						onClick={() => setLayout("single")}
					>
						单行
					</button>
					<button
						type="button"
						className={layout === "table" ? "is-active" : ""}
						onClick={() => setLayout("table")}
					>
						表格
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
							{items.map((item) => (
								<a
									className="no-styling galgame-timeline__item"
									href={`#${encodeURIComponent(item.id)}`}
									key={`${item.id}-${item.startDate}`}
									style={{
										left: ((item.start - start) / DAY) * pixelsPerDay,
										width: Math.max(
											((item.end - item.start) / DAY) * pixelsPerDay,
											2,
										),
										top: item.row * ROW_HEIGHT + 5,
										backgroundColor: item.color,
									}}
									title={`${item.name}：${item.startDate} - ${item.finishDate}`}
								>
									<span>{item.name}</span>
								</a>
							))}
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
										item.segmentStart,
										year,
										monthWidth,
									);
									const right = positionInYear(
										item.segmentEnd,
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
											}}
											title={`${item.name}：${item.startDate} - ${item.finishDate}`}
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
