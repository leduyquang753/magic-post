"use client";

import {useEffect, useRef, useState} from "react";
import useSWR from "swr";

import {
	Button,
	Card,
	CardHeader,
	Colors,
	Dropdown,
	Field,
	LargeTitle,
	Option,
	Spinner,
	Title2,
	tokens
} from "@fluentui/react-components";
import {
	ArrowClockwiseFilled,
	ErrorCircle20Filled
} from "@fluentui/react-icons";

import DashboardPageTitle from "@/common/dashboard-page-title";
import Info from "@/common/info";
import LineChart from "@/common/line-chart";
import {apiUrl} from "@/common/config";
import chartTimeRanges from "@/common/time-ranges";

async function getStatistics([url, timeRangeKey]) {
	const timeRange = chartTimeRanges[timeRangeKey];
	const response = await fetch(url + new URLSearchParams({timestamp: timeRange.apiKey}), {credentials: "include"});
	const data = await response.json();
	return {
		dateUnit: timeRange.division,
		labels: data.map(point => new Date(point.from)),
		datasets: [
			{label: "Gửi", data: data.map(point => point.status.send)},
			{label: "Nhận", data: data.map(point => point.status.receive)}
		]
	};
}

export default function FacilityStatisticsPage() {
	useEffect(() => { document.title = "Thống kê | Magic Post"; }, [true]);

	const [timeRange, setTimeRange] = useState("week");
	
	const {data, error, isLoading, mutate} = useSWR(
		[`${apiUrl}/statistic/orderSendReceive?`, timeRange], getStatistics
	);
	
	return <>
		<DashboardPageTitle>Thống kê điểm</DashboardPageTitle>
		<Field label="Khoảng thời gian" orientation="horizontal" className="mb-4 max-w-lg">
			<Dropdown
				value={chartTimeRanges[timeRange].label} selectedOptions={[timeRange]}
				onOptionSelect={(_, data) => { setTimeRange(data.selectedOptions[0]); }}
			>{Object.entries(chartTimeRanges).map(
				([key, data], index) => <Option key={key} value={key}>{data.label}</Option>
			)}</Dropdown>
		</Field>
		<Card>
			<CardHeader size="large" header={<Title2>Gửi & nhận</Title2>}/>
			{
			isLoading ? <div className="flex flex-row justify-center"><Spinner/></div>
			: error ? <>
				<Info
					icon={<ErrorCircle20Filled/>}
					backgroundColor={tokens.colorStatusDangerBackground2}
					foregroundColor={tokens.colorStatusDangerForeground2}
				>Không thể nhận dữ liệu.</Info>
				<div><Button appearance="primary" icon={<ArrowClockwiseFilled/>} onClick={() => { mutate(); }}>
					Thử lại
				</Button></div>
			</>
			: <LineChart dateUnit={data.dateUnit} dataUnit="gói hàng" data={data}/>
			}
		</Card>
	</>;
}