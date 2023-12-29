"use client";

import Link from "next/link";
import {useEffect, useState} from "react";
import useSWR from "swr";

import {
	Body1,
	Body2,
	Button,
	Card,
	Dialog,
	DialogActions,
	DialogBody,
	DialogContent,
	DialogSurface,
	DialogTitle,
	DialogTrigger,
	Field,
	Input,
	Link as TextLink,
	Spinner,
	tokens
} from "@fluentui/react-components";
import {
	ArrowClockwiseFilled,
	ErrorCircle20Filled,
	Info20Filled,
	PasswordFilled
} from "@fluentui/react-icons";

import BackButton from "@/common/back-button";
import DashboardPageTitle from "@/common/dashboard-page-title";
import Info from "@/common/info";
import PasswordInput from "@/common/password-input";
import {apiUrl} from "@/common/config";
import {roleMap} from "@/common/account-status";

const roleNameMap = {
	officeEmployee: "Office employee",
	warehouseEmployee: "Warehouse employee",
	officeManager: "Office manager",
	warehouseManager: "Warehouse manager",
	leader: "Leader"
};

async function getAccountStatus(url) {
	const response = await fetch(url, {credentials: "include"});
	const data = await response.json();
	return {
		username: data.username,
		fullName: data.fullName,
		role: roleMap[data.role]
	};
}

export default function AccountPageContent() {
	const [isPasswordChangeDialogOpen, setPasswordChangeDialogOpen] = useState(false);
	const [isOperationInProgress, setOperationInProgress] = useState(false);
	const [isOperationFailed, setOperationFailed] = useState(false);
	const [editingPassword, setEditingPassword] = useState("");
	const [editingRepeatPassword, setEditingRepeatPassword] = useState("");
	const passwordValid = editingPassword.length >= 8 && editingPassword.length <= 64;
	const repeatPasswordValid = editingPassword === editingRepeatPassword;
	
	const {data, error, isLoading, mutate} = useSWR(`${apiUrl}/role`, getAccountStatus);

	const changePassword = async () => {
		try {
			await fetch(`${apiUrl}/account`, {
				method: "PUT",
				headers: {"Content-Type": "application/json"},
				credentials: "include",
				body: JSON.stringify({
					username: data.username,
					password: editingPassword
				})
			});
			setPasswordChangeDialogOpen(false);
			mutate();
		} catch (error) {
			setOperationFailed(true);
		} finally {
			setOperationInProgress(false);
		}
	};
	
	return <div className="flex flex-col w-screen h-screen">
		<div className="flex flex-row items-center z-10" style={{
			backgroundColor: tokens.colorNeutralBackground1,
			boxShadow: tokens.shadow4
		}}>
			<Link href="/" className="flex flex-row items-center">
				<img src="/icon.svg" className="w-8 my-4 ml-4 mr-2"/>
				<div className="my-auto text-3xl leading-none italic text-brand-base select-none">Magic Post</div>
			</Link>
		</div>
		<div className="flex-1 p-4 lg:p-12 overflow-y-scroll" style={{
			backgroundColor: tokens.colorNeutralBackground3
		}}>
			<div className="mb-2"><Link href="/dashboard"><BackButton>Trang nhân viên</BackButton></Link></div>
			<DashboardPageTitle>Tài khoản</DashboardPageTitle>
			<Card>
				{
				isLoading ? <div className="flex flex-row justify-center"><Spinner/></div>
				: error ? <>
					<Info
						icon={<ErrorCircle20Filled/>}
						backgroundColor={tokens.colorStatusDangerBackground2}
						foregroundColor={tokens.colorStatusDangerForeground2}
					>Không thể nhận dữ liệu.</Info>
					<div><Button appearance="primary" icon={<ArrowClockwiseFilled/>} onClick={() => { mutate(); }}>
						Thử lại
					</Button></div>
				</>
				: <>
					<Info
						icon={<Info20Filled/>}
						backgroundColor={tokens.colorPaletteBlueBackground2}
						foregroundColor={tokens.colorPaletteBlueForeground2}
					>
						{data.role === "leader"
						? <>
							Bạn có thể thay đổi thông tin tài khoản trong{" "}<Link inline href="/dashboard/leaders">
								<TextLink inline as="span"><Body1>trang tài khoản lãnh đạo</Body1></TextLink>
							</Link>.
						</>
						: <>Liên hệ với quản lí của bạn để thay đổi thông tin tài khoản.</>}
					</Info>
					<Body2>Tên đăng nhập: {data.username}</Body2>
					<Body2>Tên đầy đủ: {data.fullName}</Body2>
					<Body2>Vị trí: {roleNameMap[data.role]}</Body2>
					<div><Button appearance="primary" icon={<PasswordFilled/>} onClick={() => {
						setEditingPassword("");
						setEditingRepeatPassword("");
						setPasswordChangeDialogOpen(true);
					}}>Đổi mật khẩu</Button></div>
				</>
				}
			</Card>
			<Dialog open={isPasswordChangeDialogOpen} onOpenChange={(_, {open}) => {
				if (!open && isOperationInProgress) return;
				setPasswordChangeDialogOpen(false);
			}}>
				<DialogSurface><DialogBody>
					<DialogTitle>Đổi mật khẩu</DialogTitle>
					<DialogContent>
						{isOperationFailed && <Info
							icon={<ErrorCircle20Filled/>}
							backgroundColor={tokens.colorStatusDangerBackground2}
							foregroundColor={tokens.colorStatusDangerForeground2}
						>Thao tác đã bị thất bại.</Info>}
						<Field
							label="Mật khẩu" required className="mb-2"
							validationState={passwordValid ? "none" : "error"}
							validationMessage={passwordValid ? null : "Phải từ 8 đến 64 kí tự."}
						>
							<PasswordInput
								value={editingPassword}
								onChange={(_, {value}) => { setEditingPassword(value); }}
							/>
						</Field>
						<Field
							label="Nhắc lại mật khẩu" required
							validationState={repeatPasswordValid ? "none" : "error"}
							validationMessage={repeatPasswordValid ? null : "PHải khớp với mật khẩu."}
						>
							<PasswordInput
								value={editingRepeatPassword}
								onChange={(_, {value}) => { setEditingRepeatPassword(value); }}
							/>
						</Field>
					</DialogContent>
					<DialogActions fluid>
						{isOperationInProgress && <Spinner size="tiny" className="mr-2"/>}
						<DialogTrigger disableButtonEnhancement>
							<Button appearance="secondary" disabled={isOperationInProgress}>Hủy</Button>
						</DialogTrigger>
						<Button
							appearance="primary"
							onClick={changePassword}
							disabled={!(passwordValid && repeatPasswordValid) || isOperationInProgress}
						>Đổi</Button>
					</DialogActions>
				</DialogBody></DialogSurface>
			</Dialog>
		</div>
	</div>;
}