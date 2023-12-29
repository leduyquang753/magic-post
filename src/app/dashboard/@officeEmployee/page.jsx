"use client";

import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function OfficeEmployeeDashboardPage() {
	const router = useRouter();
	useEffect(() => {router.replace("/dashboard/statistics"); });
	return null;
}