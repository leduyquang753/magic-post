import {cookies} from "next/headers";

import {MainPageClient} from "./page-client";
import RootWrapper from "@/common/layout-components";
import getAccountStatus from "@/common/account-status";

export default async function MainPage() {
	const role = (await getAccountStatus(cookies())).role;
	return <RootWrapper>
		<MainPageClient isLoggedIn={role !== "notLoggedIn"}/>
	</RootWrapper>;
}