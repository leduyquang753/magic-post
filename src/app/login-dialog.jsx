"use client";

import {useRouter} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogBody,
	DialogContent,
	DialogSurface,
	DialogTitle,
	DialogTrigger,
	Field,
	Input,
	Spinner,
	tokens
} from "@fluentui/react-components";
import {ErrorCircle20Filled} from "@fluentui/react-icons";

import Info from "@/common/info";
import {apiUrl} from "@/common/config";

export function LoginDialog({children}) {
	const [isOpen, setOpen] = useState(false);
	const [isLoggingIn, setLoggingIn] = useState(false);
	const [failReason, setFailReason] = useState(null);
	const formRef = useRef(null);
	const router = useRouter();
	const onSubmit = async event => {
		event.preventDefault();
		setLoggingIn(true);
		try {
			const formData = new FormData(formRef.current);
			const response = await fetch(`${apiUrl}/login`, {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				credentials: "include",
				body: JSON.stringify({
					username: formData.get("username"),
					password: formData.get("password")
				})
			});
			if (response.ok) {
				router.push("/dashboard");
			} else if (response.status === 401 || response.status === 403) {
				setFailReason("Thông tin không khớp với một tài khoản. Vui lòng thử lại.");
				setLoggingIn(false);
			} else {
				throw new Error();
			}
		} catch (error) {
			setFailReason("Không thể đăng nhập. Vui lòng kiểm tra kết nối mạng và thử lại.");
			setLoggingIn(false);
		}
	};
	return <Dialog open={isOpen} onOpenChange={(_, {open}) => {
		if (!open && isLoggingIn) return;
		setOpen(open);
	}}>
		<DialogTrigger disableButtonEnhancement>
			{children}
		</DialogTrigger>
		<DialogSurface>
			<form ref={formRef} onSubmit={onSubmit}><DialogBody>
				<DialogTitle>Đăng nhập</DialogTitle>
				<DialogContent>
					{failReason !== null && <Info
						icon={<ErrorCircle20Filled/>}
						backgroundColor={tokens.colorStatusDangerBackground2}
						foregroundColor={tokens.colorStatusDangerForeground2}
					>{failReason}</Info>}
					<Field label="Tên đăng nhập" required className="mb-4">
						<Input name="username" type="text" appearance="underline"/>
					</Field>
					<Field label="Mật khẩu" required>
						<PasswordInput/>
					</Field>
				</DialogContent>
				<DialogActions fluid>
					{isLoggingIn && <Spinner size="tiny" className="mr-2"/>}
					<DialogTrigger disableButtonEnhancement>
						<Button appearance="secondary" disabled={isLoggingIn}>Hủy</Button>
					</DialogTrigger>
					<Button type="submit" appearance="primary" disabled={isLoggingIn}>Đăng nhập</Button>
				</DialogActions>
			</DialogBody></form>
		</DialogSurface>
	</Dialog>;
}

// This is needed as Fluent UI doesn't pass in the `minlength` attribute.
function PasswordInput() {
	const passwordInputRef = useRef(null);
	useEffect(() => {
		const element = passwordInputRef.current;
		if (element !== null) {
			element.setAttribute("minlength", "8");
			element.setAttribute("maxlength", "64");
		}
	});
	return <Input name="password" type="password" appearance="underline" ref={passwordInputRef}/>;
}