"use client";

import {useEffect, useRef} from "react";

import {Input} from "@fluentui/react-components";

// This is needed as Fluent UI doesn't pass in the `minlength` attribute.
export default function PasswordInput({value, onChange}) {
	const passwordInputRef = useRef(null);
	useEffect(() => {
		const element = passwordInputRef.current;
		if (element !== null) {
			element.setAttribute("minlength", "8");
			element.setAttribute("maxlength", "64");
		}
	});
	return <Input name="password" type="password" ref={passwordInputRef} value={value} onChange={onChange}/>;
}