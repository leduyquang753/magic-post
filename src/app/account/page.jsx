import AccountPageContent from "./page-content";

import RootWrapper from "@/common/layout-components";

export const metadata = {
	title: "Tài khoản | Magic Post"
};

export default function AccountPage() {
	return <RootWrapper>
		<AccountPageContent/>
	</RootWrapper>;
}