"use client";

import useSWR from "swr";
import useSWRImmutable from "swr/immutable";

import {Option} from "@fluentui/react-components";

import {apiUrl} from "@/common/config";

async function getCities(url) {
	const response = await fetch(url, {credentials: "include"});
	return (await response.json()).sort((a, b) => a.name.localeCompare(b.name));
}
async function getDistricts([url, cityId]) {
	if (cityId === "none") return [];
	const response = await fetch(`${url}/${cityId}`, {credentials: "include"});
	return (await response.json())
		.map(district => ({id: district.id, name: district.districtName}))
		.sort((a, b) => a.name.localeCompare(b.name));
}

export function useCities() {
	return useSWRImmutable(`${apiUrl}/city`, getCities);
}
export function useDistricts(cityId) {
	return useSWR([`${apiUrl}/city/getDistricts`, cityId], getDistricts);
}

export function LocationOptions({entries, withNone}) {
	return <>
		{withNone !== undefined && <Option key="none" value="none" text="">[None]</Option>}
		{entries !== undefined && entries.map(
			entry => <Option key={entry.id} value={entry.id} text={entry.name}>{entry.name}</Option>
		)}
	</>;
}