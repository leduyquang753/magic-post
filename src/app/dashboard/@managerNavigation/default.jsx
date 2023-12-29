"use client";

import {useContext} from "react";

import {Tab} from "@fluentui/react-components";
import {
	DataTrendingFilled,
	DataTrendingRegular,
	PeopleFilled,
	PeopleRegular
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
			icon={currentPage === "employees" ? <PeopleFilled/> : <PeopleRegular/>}
			value="employees"
		>Tài khoản nhân viên</Tab>
	</>;
}