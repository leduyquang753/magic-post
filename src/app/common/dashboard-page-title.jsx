"use client";

import {LargeTitle} from "@fluentui/react-components";

export default function DashboardPageTitle({children}) {
	return <div className="mb-4"><LargeTitle as="h1">{children}</LargeTitle></div>
}