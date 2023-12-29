"use client";

import {useContext} from "react";

import {Tab} from "@fluentui/react-components";
import {
	BoxFilled,
	BoxRegular,
	DataTrendingFilled,
	DataTrendingRegular,
	SparkleFilled,
	SparkleRegular
} from "@fluentui/react-icons";

import {NavigationContext} from "../navigation-context";

export default function OfficeEmployeeNavigation() {
	const currentPage = useContext(NavigationContext);
	return <>
		<Tab
			icon={currentPage === "statistics" ? <DataTrendingFilled/> : <DataTrendingRegular/>}
			value="statistics"
		>Thống kê</Tab>
		<Tab
			icon={currentPage === "parcels" ? <BoxFilled/> : <BoxRegular/>}
			value="parcels"
		>Các gói hàng</Tab>
		<Tab
			icon={currentPage === "new-order" ? <SparkleFilled/> : <SparkleRegular/>}
			value="new-order"
		>Tạo đơn</Tab>
	</>;
}