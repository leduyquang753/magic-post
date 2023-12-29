import {apiUrl} from "@/common/config";

export const roleMap = {
	transacting: "officeEmployee",
	gathering: "warehouseEmployee",
	dean_tran: "officeManager",
	dean_gather: "warehouseManager",
	leader: "leader"
};

export default async function getAccountStatus(cookies) {
	const sessionId = cookies.get("connect.sid");
	if (sessionId === undefined) return {role: "notLoggedIn"};
	try {
		const response = await fetch(`${apiUrl}/role`, {
			headers: {Cookie: `connect.sid=${sessionId.value};`},
			cache: "no-store"
		});
		if (response.ok) {
			const data = await response.json();
			console.log(data);
			return {
				username: data.username,
				fullName: data.fullName,
				role: roleMap[data.role]
			};
		} else {
			console.log(await response.json());
			return {role: "notLoggedIn"};
		}
	} catch (error) {
		console.error(error);
		return {role: "notLoggedIn"};
	}
}