"use client";

import {
	FluentProvider,
	SSRProvider
} from "@fluentui/react-components";

import {lightTheme} from "./theme";

export default function RootWrapper({children}) {
	return <SSRProvider><FluentProvider theme={lightTheme}>
		{children}
	</FluentProvider></SSRProvider>;
}