"use client";

import {useContext, useEffect, useState} from "react";
import useSWR from "swr";

import {
	Body1,
	Body2,
	Button,
	Card,
	DataGrid,
	DataGridBody,
	DataGridCell,
	DataGridHeader,
	DataGridHeaderCell,
	DataGridRow,
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
	Tooltip,
	createTableColumn,
	tokens
} from "@fluentui/react-components";
import {
	ArrowClockwiseRegular,
	DeleteRegular,
	EditRegular,
	ErrorCircle20Filled,
	PasswordRegular,
	PersonAddFilled
} from "@fluentui/react-icons";

import AccountStatusContext from "@/common/account-status-context";
import DashboardPageTitle from "@/common/dashboard-page-title";
import Info from "@/common/info";
import PasswordInput from "@/common/password-input";
import {apiUrl} from "@/common/config";
const usernamePattern = /^\w+$/;

async function getAccounts(url) {
	const response = await fetch(url, {credentials: "include"});
	return await response.json();
}

export default function EmployeeAccountsPage() {
	useEffect(() => { document.title = "Tài khoản nhân viên | Magic Post"; }, [true]);

	const accountStatus = useContext(AccountStatusContext);

	const [isCreationDialogOpen, setCreationDialogOpen] = useState(false);
	const [isDeletionDialogOpen, setDeletionDialogOpen] = useState(false);
	const [isEditingDialogOpen, setEditingDialogOpen] = useState(false);
	const [isPasswordChangeDialogOpen, setPasswordChangeDialogOpen] = useState(false);
	const [isOperationInProgress, setOperationInProgress] = useState(false);
	const [isOperationFailed, setOperationFailed] = useState(false);

	const [editingUsername, setEditingUsername] = useState("");
	const [editingFullName, setEditingFullName] = useState("");
	const [editingPassword, setEditingPassword] = useState("");
	const [editingRepeatPassword, setEditingRepeatPassword] = useState("");
	const usernameValid = usernamePattern.test(editingUsername);
	const fullNameValid = editingFullName.trim().length !== 0;
	const passwordValid = editingPassword.length >= 8 && editingPassword.length <= 64;
	const repeatPasswordValid = editingPassword === editingRepeatPassword;

	const resetFormData = () => {
		setOperationInProgress(false);
		setOperationFailed(false);
		setEditingUsername("");
		setEditingFullName("");
		setEditingPassword("");
		setEditingRepeatPassword("");
	};

	const performOperation = async (fetchPromise, setDialogOpen) => {
		try {
			await fetchPromise;
			setDialogOpen(false);
			mutate();
		} catch (error) {
			setOperationFailed(true);
		} finally {
			setOperationInProgress(false);
		}
	};
	const createAccount = async () => {
		await performOperation(fetch(`${apiUrl}/account`, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			credentials: "include",
			body: JSON.stringify({
				username: editingUsername,
				fullName: editingFullName.trim(),
				password: editingPassword
			})
		}), setCreationDialogOpen);
	};
	const editAccountInformation = async () => {
		await performOperation(fetch(`${apiUrl}/account?` + new URLSearchParams({username: editingUsername}), {
			method: "PUT",
			headers: {"Content-Type": "application/json"},
			credentials: "include",
			body: JSON.stringify({
				fullName: editingFullName.trim()
			})
		}), setEditingDialogOpen);
	};
	const changeAccountPassword = async () => {
		await performOperation(fetch(`${apiUrl}/account?` + new URLSearchParams({username: editingUsername}), {
			method: "PUT",
			headers: {"Content-Type": "application/json"},
			credentials: "include",
			body: JSON.stringify({
				password: editingPassword
			})
		}), setPasswordChangeDialogOpen);
	};
	const deleteAccount = async () => {
		await performOperation(fetch(`${apiUrl}/account?` + new URLSearchParams({username: editingUsername}), {
			method: "DELETE",
			credentials: "include"
		}), setDeletionDialogOpen);
	};
	
	const {data, error, isLoading, mutate} = useSWR(`${apiUrl}/account`, getAccounts);

	const columnDefinitions = [
		createTableColumn({
			columnId: "username",
			renderHeaderCell: () => "Tên đăng nhập",
			renderCell: account => account.username
		}),
		createTableColumn({
			columnId: "fullName",
			renderHeaderCell: () => "Tên đầy đủ",
			renderCell: account => account.fullName
		}),
		createTableColumn({
			columnId: "actions",
			renderHeaderCell: () => "Thao tác",
			renderCell: account => <>
				<Tooltip relationship="label" content="Edit information"><Button
					appearance="subtle" shape="circular" icon={<EditRegular/>}
					onClick={() => {
						resetFormData();
						setEditingUsername(account.username);
						setEditingFullName(account.fullName);
						setEditingDialogOpen(true);
					}}
				/></Tooltip>
				<Tooltip relationship="label" content="Change password"><Button
					appearance="subtle" shape="circular" icon={<PasswordRegular/>}
					onClick={() => {
						resetFormData();
						setEditingUsername(account.username);
						setPasswordChangeDialogOpen(true);
					}}
				/></Tooltip>
				{accountStatus.username !== account.username && <Tooltip relationship="label" content="Delete">
					<Button
						appearance="subtle" shape="circular" icon={<DeleteRegular/>}
						onClick={() => {
							resetFormData();
							setEditingUsername(account.username);
							setDeletionDialogOpen(true);
						}}
					/>
				</Tooltip>}
			</>
		})
	];
	return <>
		<DashboardPageTitle>Các tài khoản nhân viên</DashboardPageTitle>
		<Card>
			<div className="flex flex-row">
				<div className="flex-1">
					<Button
						appearance="primary" icon={<PersonAddFilled/>}
						onClick={() => {
							resetFormData();
							setCreationDialogOpen(true);
						}}
					>Thêm tài khoản nhân viên</Button>
				</div>
				<div><Tooltip relationship="label" content="Tải lại kết quả">
					<Button appearance="subtle" icon={<ArrowClockwiseRegular/>} onClick={() => { mutate(); }}/>
				</Tooltip></div>
			</div>
			{
				isLoading ? <div className="flex flex-row justify-center"><Spinner/></div>
				: error ? <Info
					icon={<ErrorCircle20Filled/>}
					backgroundColor={tokens.colorStatusDangerBackground2}
					foregroundColor={tokens.colorStatusDangerForeground2}
				>Không thể nhận dữ liệu, vui lòng thử lại.</Info>
				: data.length === 0 ? <Body2 italic className="ml-4">Chưa có tài khoản nhân viên nào.</Body2>
				: <div className="flex flex-row overflow-x-scroll"><DataGrid
					columns={columnDefinitions} items={data}
					className="flex-1 min-w-[30rem]"
				>
					<DataGridHeader><DataGridRow>
						{({renderHeaderCell}) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
					</DataGridRow></DataGridHeader>
					<DataGridBody>
						{({item, rowId}) => <DataGridRow key={rowId}>
							{({renderCell}) => <DataGridCell>
								<span className="break-words overflow-auto">{renderCell(item)}</span>
							</DataGridCell>}
						</DataGridRow>}
					</DataGridBody>
				</DataGrid></div>
			}
		</Card>
		<Dialog open={isCreationDialogOpen} onOpenChange={(_, {open}) => {
			if (!open && isOperationInProgress) return;
			setCreationDialogOpen(false);
		}}>
			<DialogSurface><DialogBody>
				<DialogTitle>Tạo tài khoản nhân viên</DialogTitle>
				<DialogContent>
					{isOperationFailed && <Info
						icon={<ErrorCircle20Filled/>}
						backgroundColor={tokens.colorStatusDangerBackground2}
						foregroundColor={tokens.colorStatusDangerForeground2}
					>Thao tác đã bị thất bại.</Info>}
					<Field
						label="Tên đăng nhập" required className="mb-2"
						validationState={usernameValid ? "none" : "error"}
						validationMessage={
							usernameValid ? null : "Chỉ được chứa các chữ cái tiếng Anh, chữ số và dấu gạch dưới."
						}
					><Input
						type="text" value={editingUsername}
						onChange={(_, {value}) => { setEditingUsername(value); }}
					/></Field>
					<Field
						label="Tên đầy đủ" required className="mb-2"
						validationState={fullNameValid ? "none" : "error"}
						validationMessage={fullNameValid ? null : "Cần có."}
					><Input
						type="text" value={editingFullName}
						onChange={(_, {value}) => { setEditingFullName(value); }}
					/></Field>
					<Field
						label="Mật khẩu" required className="mb-2"
						validationState={passwordValid ? "none" : "error"}
						validationMessage={passwordValid ? null : "Phải từ 8 đến 64 kí tự."}
					><PasswordInput
						value={editingPassword}
						onChange={(_, {value}) => { setEditingPassword(value); }}
					/></Field>
					<Field
						label="Nhắc lại mật khẩu" required
						validationState={repeatPasswordValid ? "none" : "error"}
						validationMessage={repeatPasswordValid ? null : "Phải khớp với mật khẩu."}
					><PasswordInput
						value={editingRepeatPassword}
						onChange={(_, {value}) => { setEditingRepeatPassword(value); }}
					/></Field>
				</DialogContent>
				<DialogActions fluid>
					{isOperationInProgress && <Spinner size="tiny" className="mr-2"/>}
					<DialogTrigger disableButtonEnhancement>
						<Button appearance="secondary" disabled={isOperationInProgress}>Hủy</Button>
					</DialogTrigger>
					<Button
						appearance="primary"
						onClick={createAccount}
						disabled={
							!(usernameValid && fullNameValid && passwordValid && repeatPasswordValid)
							|| isOperationInProgress
						}
					>Tạo</Button>
				</DialogActions>
			</DialogBody></DialogSurface>
		</Dialog>
		<Dialog open={isEditingDialogOpen} onOpenChange={(_, {open}) => {
			if (!open && isOperationInProgress) return;
			setEditingDialogOpen(false);
		}}>
			<DialogSurface><DialogBody>
				<DialogTitle>Sửa thông tin tài khoản nhân viên</DialogTitle>
				<DialogContent>
					{isOperationFailed && <Info
						icon={<ErrorCircle20Filled/>}
						backgroundColor={tokens.colorStatusDangerBackground2}
						foregroundColor={tokens.colorStatusDangerForeground2}
					>Thao tác đã bị thất bại.</Info>}
					<div className="mb-2"><Body1>Tên đăng nhập: {editingUsername}</Body1></div>
					<Field
						label="Tên đầy đủ" required
						validationState={fullNameValid ? "none" : "error"}
						validationMessage={fullNameValid ? null : "Cần có."}
					><Input
						type="text" value={editingFullName}
						onChange={(_, {value}) => { setEditingFullName(value); }}
					/></Field>
				</DialogContent>
				<DialogActions fluid>
					{isOperationInProgress && <Spinner size="tiny" className="mr-2"/>}
					<DialogTrigger disableButtonEnhancement>
						<Button appearance="secondary" disabled={isOperationInProgress}>Hủy</Button>
					</DialogTrigger>
					<Button
						appearance="primary"
						onClick={editAccountInformation} disabled={!fullNameValid || isOperationInProgress}
					>Lưu</Button>
				</DialogActions>
			</DialogBody></DialogSurface>
		</Dialog>
		<Dialog open={isPasswordChangeDialogOpen} onOpenChange={(_, {open}) => {
			if (!open && isOperationInProgress) return;
			setPasswordChangeDialogOpen(false);
		}}>
			<DialogSurface><DialogBody>
				<DialogTitle>Đổi mật khẩu tài khoản nhân viên</DialogTitle>
				<DialogContent>
					{isOperationFailed && <Info
						icon={<ErrorCircle20Filled/>}
						backgroundColor={tokens.colorStatusDangerBackground2}
						foregroundColor={tokens.colorStatusDangerForeground2}
					>Thao tác đã bị thất bại.</Info>}
					<div className="mb-2"><Body1>Tên đăng nhập: {editingUsername}</Body1></div>
					<Field
						label="Mật khẩu" required className="mb-2"
						validationState={passwordValid ? "none" : "error"}
						validationMessage={passwordValid ? null : "Phải từ 8 đến 64 kí tự."}
					><PasswordInput
						value={editingPassword}
						onChange={(_, {value}) => { setEditingPassword(value); }}
					/></Field>
					<Field
						label="Nhắc lại mật khẩu" required
						validationState={repeatPasswordValid ? "none" : "error"}
						validationMessage={repeatPasswordValid ? null : "Phải khớp với mật khẩu."}
					><PasswordInput
						value={editingRepeatPassword}
						onChange={(_, {value}) => { setEditingRepeatPassword(value); }}
					/></Field>
				</DialogContent>
				<DialogActions fluid>
					{isOperationInProgress && <Spinner size="tiny" className="mr-2"/>}
					<DialogTrigger disableButtonEnhancement>
						<Button appearance="secondary" disabled={isOperationInProgress}>Hủy</Button>
					</DialogTrigger>
					<Button
						appearance="primary"
						onClick={changeAccountPassword}
						disabled={!(passwordValid && repeatPasswordValid) || isOperationInProgress}
					>Đổi</Button>
				</DialogActions>
			</DialogBody></DialogSurface>
		</Dialog>
		<Dialog open={isDeletionDialogOpen} onOpenChange={(_, {open}) => {
			if (!open && isOperationInProgress) return;
			setDeletionDialogOpen(false);
		}}>
			<DialogSurface><DialogBody>
				<DialogTitle>Xóa tài khoản nhân viên?</DialogTitle>
				<DialogContent>
					{isOperationFailed && <Info
						icon={<ErrorCircle20Filled/>}
						backgroundColor={tokens.colorStatusDangerBackground2}
						foregroundColor={tokens.colorStatusDangerForeground2}
					>Thao tác đã bị thất bại.</Info>}
					<Body1>Bạn có chắc muốn xóa tài khoản nhân viên "{editingUsername}"?</Body1>
				</DialogContent>
				<DialogActions fluid>
					{isOperationInProgress && <Spinner size="tiny" className="mr-2"/>}
					<DialogTrigger disableButtonEnhancement>
						<Button appearance="secondary" disabled={isOperationInProgress}>Hủy</Button>
					</DialogTrigger>
					<Button
						appearance="primary" onClick={deleteAccount} disabled={isOperationInProgress}
					>Xóa</Button>
				</DialogActions>
			</DialogBody></DialogSurface>
		</Dialog>
	</>;
}