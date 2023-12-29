import {cookies} from "next/headers";
import {notFound} from "next/navigation";

import {AccountStatusProvider} from "@/common/account-status-context";
import RootWrapper from "@/common/layout-components";
import {Scaffold} from "./scaffold";
import getAccountStatus from "@/common/account-status";

export const metadata = {
	title: "Trang nhân viên Magic Post"
};

export default async function DashboardLayout(props) {
	const accountStatus = await getAccountStatus(cookies());
	let role = accountStatus.role;
	if (role === "notLoggedIn") notFound();
	if (role === "officeManager" || role === "warehouseManager") role = "manager";
	return <RootWrapper>
		<AccountStatusProvider value={accountStatus}>
			<Scaffold role={role} navigationContent={props[`${role}Navigation`]}>
				{props[role]}
			</Scaffold>
		</AccountStatusProvider>
	</RootWrapper>;
}