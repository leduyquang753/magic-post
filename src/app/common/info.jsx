"use client";

import {cloneElement} from "react";
import {Body1} from "@fluentui/react-components";

export default function Info({icon, backgroundColor, foregroundColor, children}) {
	return <div className="mb-2 p-4 flex flex-row items-center" style={{backgroundColor: backgroundColor}}>
		<div className="mr-2">{cloneElement(icon, {primaryFill: foregroundColor})}</div>
		<div className="flex-1"><Body1 style={{color: foregroundColor}}>
			{children}
		</Body1></div>
	</div>
}