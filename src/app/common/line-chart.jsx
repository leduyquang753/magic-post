"use client";

import * as ChartJs from "chart.js";
import {useRef, useState} from "react";
import {Line} from "react-chartjs-2";

import {Body1} from "@fluentui/react-components";

import "@/common/chartjs-setup";
import Formatter from "@/common/formatter";

let loaded = false;
if (!loaded) {
	ChartJs.Chart.register(
		ChartJs.Colors,
		ChartJs.Legend,
		ChartJs.LineElement,
		ChartJs.LinearScale,
		ChartJs.PointElement,
		ChartJs.TimeScale,
		ChartJs.Tooltip
	);
	loaded = true;
}

const tooltipFormatMap = {
	hour: "H'h' d/M/yyyy",
	day: "d/M/yyyy",
	month: "M/yyyy"
};

export default function LineChart({dateUnit, dataUnit, data, className}) {
	const chartOptions = {
		aspectRatio: 4,
		scales: {
			x: {
				type: "time",
				time: {
					unit: dateUnit,
					tooltipFormat: tooltipFormatMap[dateUnit]
				}
			},
			y: {
				beginAtZero: true,
				ticks: {
					stepSize: 1,
					callback: (number) => Formatter.formatNumber(number)
				}
			}
		},
		interaction: {
			intersect: false,
			mode: "nearest",
			axis: "x"
		},
		plugins: {
			tooltip: {
				callbacks: {
					label: (context) => (
						context.dataset.label + ": "
						+ Formatter.formatNumber(context.parsed.y) + " " + dataUnit
					)
				}
			},
			legend: {display: false}
		},
		pointBorderWidth: 0,
		pointRadius: 4,
		pointHoverRadius: 4,
		pointHitRadius: 16,
		animation: false
	};
	
	const [labels, setLabels] = useState([]);
	const legendPlugin = useRef({
		id: "magicPost-legend",
		afterUpdate: (chart, args, options) => {
			const newLabels = chart.options.plugins.legend.labels.generateLabels(chart);
			setLabels(current => current.length === 0 ? newLabels : current);
		}
	}).current;
	
	return <div className={className}>
		<Line plugins={[legendPlugin]} options={chartOptions} data={data}/>
		<div>{labels.map(label => {
			const dataset = data.datasets[label.datasetIndex];
			return <div key={label.datasetIndex} className="flex flex-row items-center">
				<span className="inline-block w-8 h-4 mr-2" style={{
					background: label.fillStyle,
					borderColor: label.strokeStyle,
					borderWidth: label.lineWidth + "px"
				}}/>
				<Body1>{dataset.label}: {
					Formatter.formatNumber(dataset.data.reduce((sum, current) => sum + current))
				} {dataUnit}</Body1>
			</div>;
		})}</div>
	</div>;
}