export default function TotalDuration({ data }) {
	return (
		<p>
			总时长 <code>{data.secondsCount}</code> 秒， 合{" "}
			<code>{data.minutesCount}</code> 分钟， 或 <code>{data.hoursCount}</code>{" "}
			小时。
		</p>
	);
}
