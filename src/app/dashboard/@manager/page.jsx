"use client";

import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function ManagerDashboardPage() {
	const router = useRouter();
	useEffect(() => {router.replace("/dashboard/statistics"); });
	return null;
}