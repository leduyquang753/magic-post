"use client";

import {createContext} from "react";

const AccountStatusContext = createContext({role: "notLoggedIn"});
export default AccountStatusContext;

export function AccountStatusProvider({value, children}) {
	return <AccountStatusContext.Provider value={value}>{children}</AccountStatusContext.Provider>;
}