"use client";

import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function WarehouseEmployeeDashboardPage() {
	const router = useRouter();
	useEffect(() => {router.replace("/dashboard/parcels"); });
	return null;
}