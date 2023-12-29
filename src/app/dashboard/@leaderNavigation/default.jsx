"use client";

import {useContext} from "react";

import {Tab} from "@fluentui/react-components";
import {
	BuildingRetailFilled,
	BuildingRetailRegular,
	DataTrendingFilled,
	DataTrendingRegular,
	PersonLightningFilled,
	PersonLightningRegular
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
			icon={currentPage === "facilities" ? <BuildingRetailFilled/> : <BuildingRetailRegular/>}
			value="facilities"
		>Các điểm</Tab>
		<Tab
			icon={currentPage === "leaders" ? <PersonLightningFilled/> : <PersonLightningRegular/>}
			value="leaders"
		>Tài khoản lãnh đạo</Tab>
	</>;
}