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
	Dropdown,
	Field,
	Input,
	Link as TextLink,
	Option,
	Spinner,
	Subtitle1,
	Title2,
	tokens
} from "@fluentui/react-components";
import {
	ArrowClockwiseFilled,
	EditFilled,
	ErrorCircle20Filled,
	PasswordRegular,
	PersonAddFilled,
	PersonDeleteFilled,
	PersonEditFilled
} from "@fluentui/react-icons";

import BackButton from "@/common/back-button";
import DashboardPageTitle from "@/common/dashboard-page-title";
import Info from "@/common/info";
import LineChart from "@/common/line-chart";
import {LocationOptions, useCities, useDistricts} from "@/common/location-components";
import PasswordInput from "@/common/password-input";
import {apiUrl} from "@/common/config";
import chartTimeRanges from "@/common/time-ranges";

const usernamePattern = /^\w+$/;

class FetchFailedError extends Error {
	constructor(errorCode) {
		super(`Fetch failed with code ${errorCode}.`);
		this.errorCode = errorCode;
	}
}

async function getFacilityOrAccount(url) {
	const response = await fetch(url, {credentials: "include"});
	if (!response.ok) throw new FetchFailedError(response.status);
	const data = await response.json();
	if (data.length === 0) throw new FetchFailedError(404);
	return data[0];
}

async function getStatistics([url, facilityId, timeRangeKey]) {
	const timeRange = chartTimeRanges[timeRangeKey];
	const response = await fetch(
		url + new URLSearchParams({transaction: facilityId, timestamp: timeRange.apiKey}),
		{credentials: "include"}
	);
	const data = await response.json();
	return {
		dateUnit: timeRange.division,
		labels: data.map(point => new Date(point.from)),
		datasets: [
			{label: "Gửi", data: data.map(point => point.status.send)},
			{label: "Nhận", data: data.map(point => point.status.receive)}
		]
	};
}

export default function FacilityPageContent({params}) {
	const [timeRange, setTimeRange] = useState("week");
	
	const [isEditingDialogOpen, setEditingDialogOpen] = useState(false);
	const [isManagerCreationDialogOpen, setManagerCreationDialogOpen] = useState(false);
	const [isManagerDeletionDialogOpen, setManagerDeletionDialogOpen] = useState(false);
	const [isManagerEditingDialogOpen, setManagerEditingDialogOpen] = useState(false);
	const [isManagerPasswordChangeDialogOpen, setManagerPasswordChangeDialogOpen] = useState(false);
	const [isOperationInProgress, setOperationInProgress] = useState(false);
	const [isOperationFailed, setOperationFailed] = useState(false);
	
	const [editingName, setEditingName] = useState("");
	const [editingCityId, setEditingCityId] = useState("none");
	const [editingCityName, setEditingCityName] = useState("");
	const [editingDistrictId, setEditingDistrictId] = useState("none");
	const [editingDistrictName, setEditingDistrictName] = useState("");
	const [editingAddress, setEditingAddress] = useState("");
	const [editingWarehouseId, setEditingWarehouseId] = useState("");
	const nameValid = editingName.trim().length !== 0;
	const cityValid = editingCityId !== "none";
	const districtValid = editingDistrictId !== "none";
	const addressValid = editingAddress.trim().length !== 0;
	const warehouseIdValid = /^\d{4}$/.test(editingWarehouseId);
	
	const [editingUsername, setEditingUsername] = useState("");
	const [editingFullName, setEditingFullName] = useState("");
	const [editingPassword, setEditingPassword] = useState("");
	const [editingRepeatPassword, setEditingRepeatPassword] = useState("");
	const usernameValid = usernamePattern.test(editingUsername);
	const fullNameValid = editingFullName.trim().length !== 0;
	const passwordValid = editingPassword.length >= 8 && editingPassword.length <= 64;
	const repeatPasswordValid = editingPassword === editingRepeatPassword;
	
	const facilityType = params.number.slice(0, 2) === "GD" ? "office" : "warehouse";
	const endpoint = facilityType === "office" ? `${apiUrl}/transaction` : `${apiUrl}/gathering`;
	const {data, error, isLoading, mutate} = useSWR(
		endpoint + "?" + new URLSearchParams({id: params.number}), getFacilityOrAccount
	);
	const {
		data: statisticsData, error: statisticsError, isLoading: isStatisticsLoading, mutate: mutateStatistics
	} = useSWR(
		isLoading || error !== undefined || data.manager === null
			? null
			: [`${apiUrl}/statistic/orderSendReceive?`, params.number, timeRange],
		getStatistics
	);
	const {data: managerData, error: managerError, isLoading: isManagerLoading, mutate: mutateManager} = useSWR(
		isLoading || error !== undefined || data.manager === null
			? null
			: `${apiUrl}/account?` + new URLSearchParams({username: data.manager}),
		getFacilityOrAccount
	);
	const {data: cities} = useCities();
	const {data: editingDistricts} = useDistricts(editingCityId);
	useEffect(() => {
		if (data !== undefined) document.title = `${params.number}. ${data.name} | Magic Post`;
		else document.title = `${params.number} | Magic Post`;
	}, [data]);

	const performOperation = async (fetchPromise, setDialogOpen) => {
		try {
			await fetchPromise;
			setDialogOpen(false);
			mutate();
			mutateManager();
		} catch (error) {
			setOperationFailed(true);
		} finally {
			setOperationInProgress(false);
		}
	};
	const editInformation = async () => {
		await performOperation(fetch(endpoint, {
			method: "PUT",
			headers: {"Content-Type": "application/json"},
			credentials: "include",
			body: JSON.stringify({
				name: editingName.trim(),
				city: editingCityId,
				district: editingDistrictId,
				address: editingAddress.trim(),
				gatheringId: `TK${editingWarehouseId}`
			})
		}), setEditingDialogOpen);
	};
	const createManagerAccount = async () => {
		await performOperation(fetch(`${apiUrl}/account`, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			credentials: "include",
			body: JSON.stringify({
				username: editingUsername,
				fullName: editingFullName.trim(),
				password: editingPassword,
				role: facilityType === "office" ? "dean_tran" : "dean_gather",
				transaction: params.number
			})
		}), setManagerCreationDialogOpen);
	};
	const editManagerAccountInformation = async () => {
		await performOperation(fetch(`${apiUrl}/account?` + new URLSearchParams({username: data.manager}), {
			method: "PUT",
			headers: {"Content-Type": "application/json"},
			credentials: "include",
			body: JSON.stringify({
				fullName: editingFullName.trim()
			})
		}), setManagerEditingDialogOpen);
	};
	const changeManagerAccountPassword = async () => {
		await performOperation(fetch(`${apiUrl}/account?` + new URLSearchParams({username: data.manager}), {
			method: "PUT",
			headers: {"Content-Type": "application/json"},
			credentials: "include",
			body: JSON.stringify({
				password: editingPassword
			})
		}), setManagerPasswordChangeDialogOpen);
	};
	const deleteManagerAccount = async () => {
		await performOperation(fetch(`${apiUrl}/account?` + new URLSearchParams({username: data.manager}), {
			method: "DELETE",
			credentials: "include"
		}), setManagerDeletionDialogOpen);
	};
	
	return <>
		<div className="mb-2"><Link href="/dashboard/facilities"><BackButton>Các điểm</BackButton></Link></div>
		<div><Subtitle1>{params.number}</Subtitle1></div>
		{
		isLoading ? <div className="flex flex-row justify-center"><Spinner/></div>
		: error ? <>
			<Info
				icon={<ErrorCircle20Filled/>}
				backgroundColor={tokens.colorStatusDangerBackground2}
				foregroundColor={tokens.colorStatusDangerForeground2}
			>{error instanceof FetchFailedError && error.errorCode === 404
			? <>Không có điểm {facilityType === "office" ? "giao dịch" : "tập kết"} nào có mã số này.</>
			: "Không thể nhận dữ liệu."
			}</Info>
			<div><Button appearance="primary" icon={<ArrowClockwiseFilled/>} onClick={() => { mutate(); }}>
				Thử lại
			</Button></div>
		</>
		: <>
			<DashboardPageTitle>
				Điểm {facilityType === "office" ? "giao dịch" : "tập kết"} {data.name}
			</DashboardPageTitle>
			<Card className="mb-4">
				<Title2 as="h2">Thống kê gửi & nhận</Title2>
				<Field label="Khoảng thời gian" orientation="horizontal" className="mb-4 max-w-lg">
					<Dropdown
						value={chartTimeRanges[timeRange].label} selectedOptions={[timeRange]}
						onOptionSelect={(_, data) => { setTimeRange(data.selectedOptions[0]); }}
					>{Object.entries(chartTimeRanges).map(
						([key, data], index) => <Option key={key} value={key}>{data.label}</Option>
					)}</Dropdown>
				</Field>
				{
				isStatisticsLoading ? <div className="flex flex-row justify-center"><Spinner/></div>
				: statisticsError ? <>
					<Info
						icon={<ErrorCircle20Filled/>}
						backgroundColor={tokens.colorStatusDangerBackground2}
						foregroundColor={tokens.colorStatusDangerForeground2}
					>Không thể nhận dữ liệu.</Info>
					<div><Button appearance="primary" icon={<ArrowClockwiseFilled/>} onClick={() => {
						mutateStatistics();
					}}>
						Thử lại
					</Button></div>
				</>
				: statisticsData &&
					<LineChart dateUnit={statisticsData.dateUnit} dataUnit="gói hàng" data={statisticsData}/>
				}
			</Card>
			<Card className="mb-4">
				<Title2 as="h2">Thông tin</Title2>
				<Body2 as="p">Địa điểm: {data.district}, {data.city}</Body2>
				<Body2 as="p">Địa chỉ: {data.address}</Body2>
				{facilityType === "office" && <Body2>
					Điểm tập kết tương ứng:{" "}<Link href={`/dashboard/facilities/${data.gatheringId}`}>
						<TextLink inline="true" as="span"><Body2>{data.gatheringId}</Body2></TextLink>
					</Link>
				</Body2>}
				<div><Button appearance="primary" icon={<EditFilled/>} onClick={() => {
					setEditingName(data.name);
					setEditingCityId(data.cityId);
					setEditingCityName(data.city);
					setEditingDistrictId(data.districtId);
					setEditingDistrictName(data.district);
					setEditingAddress(data.address);
					if (facilityType === "office") setEditingWarehouseId(data.gatheringId.slice(2));
					setEditingDialogOpen(true);
				}}>Sửa</Button></div>
			</Card>
			<Card>
				<Title2 as="h2">Quản lí</Title2>
				{data.manager === null
				? <>
					<Body2 italic>
						Chưa có tài khoản trưởng điểm được tạo cho điểm{" "}
						{facilityType === "office" ? "giao dịch" : "tập kết"} này.
					</Body2>
					<div><Button
						appearance="primary" icon={<PersonAddFilled/>}
						onClick={() => { setManagerCreationDialogOpen(true); }}
					>Thêm</Button></div>
				</>
				: isManagerLoading ? <div className="flex flex-row justify-center"><Spinner/></div>
				: managerError || managerData === undefined ? <>
					<Info
						icon={<ErrorCircle20Filled/>}
						backgroundColor={tokens.colorStatusDangerBackground2}
						foregroundColor={tokens.colorStatusDangerForeground2}
					>Không thể nhận thông tin tài khoản trưởng điểm.</Info>
					<div><Button
						appearance="primary" icon={<ArrowClockwiseFilled/>} onClick={() => { mutateManager(); }}
					>Thử lại</Button></div>
				</>
				: <>
					<Body2>Tên đăng nhập: {managerData.username}</Body2>
					<Body2>Tên đầy đủ: {managerData.fullName}</Body2>
					<div>
						<span className="mr-2"><Button
							appearance="primary" icon={<PersonEditFilled/>} onClick={() => {
								setEditingUsername(managerData.username);
								setEditingFullName(managerData.fullName);
								setManagerEditingDialogOpen(true);
							}}
						>Sửa thông tin</Button></span>
						<span className="mr-2"><Button
							icon={<PasswordRegular/>} onClick={() => {
								setEditingUsername(managerData.username);
								setManagerPasswordChangeDialogOpen(true);
							}}
						>Đổi mật khẩu</Button></span>
						<span><Button
							icon={<PersonDeleteFilled/>} onClick={() => {
								setEditingUsername(managerData.username);
								setManagerDeletionDialogOpen(true);
							}}
						>Xóa</Button></span>
					</div>
				</>}
			</Card>
		</>
		}
		<Dialog open={isEditingDialogOpen} onOpenChange={(_, {open}) => {
			if (!open && isOperationInProgress) return;
			setEditingDialogOpen(false);
		}}>
			<DialogSurface><DialogBody>
				<DialogTitle>Sửa thông tin</DialogTitle>
				<DialogContent>
					{isOperationFailed && <Info
						icon={<ErrorCircle20Filled/>}
						backgroundColor={tokens.colorStatusDangerBackground2}
						foregroundColor={tokens.colorStatusDangerForeground2}
					>Thao tác đã bị thất bại.</Info>}
					<Field
						label="Tên" required className="mb-2"
						validationState={nameValid ? "none" : "error"}
						validationMessage={nameValid ? null : "Cần có."}
					><Input
						type="text" value={editingName}
						onChange={(_, {value}) => { setEditingName(value); }}
					/></Field>
					<Field
						label="Tỉnh hoặc thành phố" required className="mb-2"
						validationState={cityValid ? "none" : "error"}
						validationMessage={cityValid ? null : "Cần được xác định."}
					><Dropdown
						positioning={{coverTarget: "true"}}
						value={editingCityName} selectedOptions={[editingCityId]}
						onOptionSelect={(_, data) => {
							setEditingCityId(data.selectedOptions[0]);
							setEditingCityName(data.optionText);
							setEditingDistrictId("none");
							setEditingDistrictName("");
						}}
					>
						<LocationOptions entries={cities}/>
					</Dropdown></Field>
					<Field
						label="Quận hoặc huyện" required className="mb-2"
						validationState={districtValid ? "none" : "error"}
						validationMessage={districtValid ? null : "Cần được xác định."}
					><Dropdown
						positioning={{coverTarget: "true"}}
						value={editingDistrictName} selectedOptions={[editingDistrictId]}
						onOptionSelect={(_, data) => {
							setEditingDistrictId(data.selectedOptions[0]);
							setEditingDistrictName(data.optionText);
						}}
					>
						<LocationOptions entries={editingDistricts}/>
					</Dropdown></Field>
					<Field
						label="Địa chỉ" required className="mb-2"
						validationState={addressValid ? "none" : "error"}
						validationMessage={addressValid ? null : "Cần có."}
					><Input
						type="text" value={editingAddress}
						onChange={(_, {value}) => { setEditingAddress(value); }}
					/></Field>
					{facilityType === "office" && <Field
						label="Mã điểm tập kết tương ứng" required className="mb-2"
						validationState={warehouseIdValid ? "none" : "error"}
						validationMessage={warehouseIdValid ? null : "Phải gồm 4 chữ số."}
					><Input
						type="text" contentBefore="TK" value={editingWarehouseId}
						onChange={(_, {value}) => { setEditingWarehouseId(value); }}
					/></Field>}
				</DialogContent>
				<DialogActions fluid>
					{isOperationInProgress && <Spinner size="tiny" className="mr-2"/>}
					<DialogTrigger disableButtonEnhancement>
						<Button appearance="secondary" disabled={isOperationInProgress}>Hủy</Button>
					</DialogTrigger>
					<Button
						appearance="primary"
						onClick={editInformation}
						disabled={!(
							nameValid && cityValid && districtValid && addressValid
							&& (facilityType === "warehouse" || warehouseIdValid)
						) || isOperationInProgress}
					>Lưu</Button>
				</DialogActions>
			</DialogBody></DialogSurface>
		</Dialog>
		<Dialog open={isManagerCreationDialogOpen} onOpenChange={(_, {open}) => {
			if (!open && isOperationInProgress) return;
			setManagerCreationDialogOpen(false);
		}}>
			<DialogSurface><DialogBody>
				<DialogTitle>Tạo tài khoản trưởng điểm</DialogTitle>
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
						onClick={createManagerAccount}
						disabled={
							!(usernameValid && fullNameValid && passwordValid && repeatPasswordValid)
							|| isOperationInProgress
						}
					>Tạo</Button>
				</DialogActions>
			</DialogBody></DialogSurface>
		</Dialog>
		<Dialog open={isManagerEditingDialogOpen} onOpenChange={(_, {open}) => {
			if (!open && isOperationInProgress) return;
			setManagerEditingDialogOpen(false);
		}}>
			<DialogSurface><DialogBody>
				<DialogTitle>Sửa thông tin tài khoản trưởng điểm</DialogTitle>
				<DialogContent>
					{isOperationFailed && <Info
						icon={<ErrorCircle20Filled/>}
						backgroundColor={tokens.colorStatusDangerBackground2}
						foregroundColor={tokens.colorStatusDangerForeground2}
					>Thao tác đã bị thất bại.</Info>}
					<div className="mb-2"><Body1>Username: {editingUsername}</Body1></div>
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
						onClick={editManagerAccountInformation} disabled={!fullNameValid || isOperationInProgress}
					>Lưu</Button>
				</DialogActions>
			</DialogBody></DialogSurface>
		</Dialog>
		<Dialog open={isManagerPasswordChangeDialogOpen} onOpenChange={(_, {open}) => {
			if (!open && isOperationInProgress) return;
			setManagerPasswordChangeDialogOpen(false);
		}}>
			<DialogSurface><DialogBody>
				<DialogTitle>Đổi mật khẩu tài khoản trưởng điểm</DialogTitle>
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
						onClick={changeManagerAccountPassword}
						disabled={!(passwordValid && repeatPasswordValid) || isOperationInProgress}
					>Đổi</Button>
				</DialogActions>
			</DialogBody></DialogSurface>
		</Dialog>
		<Dialog open={isManagerDeletionDialogOpen} onOpenChange={(_, {open}) => {
			if (!open && isOperationInProgress) return;
			setManagerDeletionDialogOpen(false);
		}}>
			<DialogSurface><DialogBody>
				<DialogTitle>Xóa tài khoản trưởng điểm?</DialogTitle>
				<DialogContent>
					{isOperationFailed && <Info
						icon={<ErrorCircle20Filled/>}
						backgroundColor={tokens.colorStatusDangerBackground2}
						foregroundColor={tokens.colorStatusDangerForeground2}
					>Thao tác đã bị thất bại.</Info>}
					<Body1>
						Bạn có chắc muốn xóa tài khoản trưởng điểm{" "}
						{facilityType === "office" ? "giao dịch" : "tập kết"} này?
					</Body1>
				</DialogContent>
				<DialogActions fluid>
					{isOperationInProgress && <Spinner size="tiny" className="mr-2"/>}
					<DialogTrigger disableButtonEnhancement>
						<Button appearance="secondary" disabled={isOperationInProgress}>Hủy</Button>
					</DialogTrigger>
					<Button
						appearance="primary" onClick={deleteManagerAccount} disabled={isOperationInProgress}
					>Xóa</Button>
				</DialogActions>
			</DialogBody></DialogSurface>
		</Dialog>
	</>;
}