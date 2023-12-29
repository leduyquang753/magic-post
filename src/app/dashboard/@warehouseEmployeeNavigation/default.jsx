"use client";

import {useContext} from "react";

import {Tab} from "@fluentui/react-components";
import {
	BoxFilled,
	BoxRegular
} from "@fluentui/react-icons";

import {NavigationContext} from "../navigation-context";

export default function OfficeEmployeeNavigation() {
	const currentPage = useContext(NavigationContext);
	return <>
		<Tab
			icon={currentPage === "parcels" ? <BoxFilled/> : <BoxRegular/>}
			value="parcels"
		>Các gói hàng</Tab>
	</>;
}