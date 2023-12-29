"use client";

import {useRouter} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import useSWR from "swr";

import {
	Accordion,
	AccordionHeader,
	AccordionItem,
	AccordionPanel,
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
	Dropdown,
	Field,
	Input,
	Label,
	LargeTitle,
	Option,
	Spinner,
	Tab,
	TabList,
	ToggleButton,
	Tooltip,
	createTableColumn,
	makeStyles,
	tokens
} from "@fluentui/react-components";
import {
	AddFilled,
	ArrowClockwiseRegular,
	ArrowDownRegular,
	ArrowUpRegular,
	ChevronLeftFilled,
	ChevronRightFilled,
	ErrorCircle20Filled,
	Search24Regular
} from "@fluentui/react-icons";

import DashboardPageTitle from "@/common/dashboard-page-title";
import Info from "@/common/info";
import {LocationOptions, useCities, useDistricts} from "@/common/location-components";
import {apiUrl} from "@/common/config";

const columnDefinitions = [
	createTableColumn({
		columnId: "number",
		renderHeaderCell: () => "Mã điểm",
		renderCell: facility => facility.id
	}),
	createTableColumn({
		columnId: "name",
		renderHeaderCell: () => "Tên",
		renderCell: facility => facility.name
	}),
	createTableColumn({
		columnId: "location",
		renderHeaderCell: () => "Vị trí",
		renderCell: facility => `${facility.district}, ${facility.city}`
	})
];

async function getFacilities([url, searchText, cityId, districtId, resultsPerPage, page]) {
	const params = {limit: resultsPerPage, page};
	if (searchText.length !== 0) params.searchValue = searchText;
	if (cityId !== "none") params.city = cityId;
	if (districtId !== "none") params.district = districtId;
	const response = await fetch(url + "?" + new URLSearchParams(params), {credentials: "include"});
	return await response.json();
}

export default function OfficeParcelsPage() {
	useEffect(() => { document.title = "Các điểm | Magic Post"; }, [true]);
	
	const router = useRouter();
	
	const [searchTuple, setSearchTuple] = useState(["", "none", "none", "50", 1]);
	const [updatingImmediately, setUpdatingImmediately] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [cityId, setCityId] = useState("none");
	const [cityName, setCityName] = useState("");
	const [districtId, setDistrictId] = useState("none");
	const [districtName, setDistrictName] = useState("");
	const [resultsPerPage, setResultsPerPage] = useState("50");
	const [facilityType, setFacilityType] = useState("office");
	const [page, setPage] = useState(1);

	const [isCreationDialogOpen, setCreationDialogOpen] = useState(false);
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
	
	const {data: cities} = useCities();
	const {data: districts} = useDistricts(cityId);
	const {data: editingDistricts} = useDistricts(editingCityId);
	const {data: facilities, error, isLoading, mutate} = useSWR([
		facilityType === "office" ? `${apiUrl}/search/transaction` : `${apiUrl}/search/gathering`,
		...searchTuple
	], getFacilities, {revalidateOnFocus: false});

	useEffect(() => {
		if (updatingImmediately) {
			setSearchTuple([searchText, cityId, districtId, resultsPerPage, page]); 
			return;
		}
		const timeoutId = setTimeout(() => {
			setPage(1);
			setSearchTuple([searchText, cityId, districtId, resultsPerPage, 1]);
		}, 500);
		return () => clearTimeout(timeoutId);
	}, [searchText, cityId, districtId, resultsPerPage, page]);
	useEffect(() => { if (updatingImmediately) setUpdatingImmediately(false); }, [updatingImmediately]);
	const createFacility = async () => {
		try {
			await fetch(facilityType === "office" ? `${apiUrl}/transaction` : `${apiUrl}/gathering`, {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				credentials: "include",
				body: JSON.stringify({
					name: editingName.trim(),
					city: editingCityId,
					district: editingDistrictId,
					address: editingAddress.trim(),
					gatheringId: `TK${editingWarehouseId}`
				})
			});
			setCreationDialogOpen(false);
			mutate();
		} catch (error) {
			setOperationFailed(true);
		} finally {
			setOperationInProgress(false);
		}
	};
	
	const goToBottomButtonRef = useRef(null);
	const goToTopButtonRef = useRef(null);
	return <>
		<DashboardPageTitle>Các điểm</DashboardPageTitle>
		<Card className="mb-4">
			<Accordion collapsible>
				<AccordionItem value="main">
					<AccordionHeader>
						<Search24Regular className="mr-2"/>
						<span className="flex-1">Tìm kiếm các điểm</span>
					</AccordionHeader>
					<AccordionPanel>
						<Field label="Tên hoặc mã điểm" className="mb-4">
							<Input type="text" value={searchText} onChange={(_, {value}) => { setSearchText(value); }}/>
						</Field>
						<div className="mb-2"><Label>Vị trí</Label></div>
						<Field label="Tỉnh, thành phố" orientation="horizontal" className="max-w-lg mb-2">
							<Dropdown
								positioning={{coverTarget: "true"}}
								value={cityName} selectedOptions={[cityId]}
								onOptionSelect={(_, data) => {
									setCityId(data.selectedOptions[0]);
									setCityName(data.optionText);
									setDistrictId("none");
									setDistrictName("");
								}}
							><LocationOptions entries={cities} withNone/></Dropdown>
						</Field>
						<Field label="Huyện, quận" orientation="horizontal" className="max-w-lg">
							<Dropdown
								positioning={{coverTarget: "true"}} disabled={cityId === "none"}
								value={districtName} selectedOptions={[districtId]}
								onOptionSelect={(_, data) => {
									setDistrictId(data.selectedOptions[0]);
									setDistrictName(data.optionText);
								}}
							><LocationOptions entries={districts} withNone/></Dropdown>
						</Field>
					</AccordionPanel>
				</AccordionItem>
			</Accordion>
			<Field label="Số kết quả mỗi trang" orientation="horizontal" className="max-w-lg">
				<Dropdown
					value={resultsPerPage} selectedOptions={[resultsPerPage]}
					onOptionSelect={(_, data) => { setResultsPerPage(data.selectedOptions[0]); }}
				>
					{["10", "20", "50", "100", "200", "500", "1000"].map(
						option => <Option key={option} value={option}>{option}</Option>
					)}
				</Dropdown>
			</Field>
		</Card>
		<Card>
			<div className="flex flex-row">
				<div className="flex-1"><TabList
					selectedValue={facilityType}
					onTabSelect={(_, {value}) => {
						setFacilityType(value);
						setPage(1);
						setUpdatingImmediately(true);
					}}
				>
					<Tab value="office">Điểm giao dịch</Tab>
					<Tab value="warehouse">Điểm tập kết</Tab>
				</TabList></div>
				<div className="mr-2"><Tooltip relationship="label" content="Tải lại kết quả">
					<Button
						appearance="subtle" icon={<ArrowClockwiseRegular/>} onClick={() => {
							if (page === 1) {
								mutate();
							} else {
								setPage(1);
								setUpdatingImmediately(true);
							}
						}}
					/>
				</Tooltip></div>
				<div ref={goToBottomButtonRef}><Tooltip relationship="label" content="Đi xuống dưới cùng">
					<Button icon={<ArrowDownRegular/>} onClick={() => {
						goToTopButtonRef.current.scrollIntoView({block: "center"});
					}}/>
				</Tooltip></div>
			</div>
			<div><Button appearance="primary" icon={<AddFilled/>} onClick={() => {
				setEditingName("");
				setEditingCityId("none");
				setEditingCityName("");
				setEditingDistrictId("none");
				setEditingDistrictName("");
				setEditingAddress("");
				setCreationDialogOpen(true);
			}}>
				{facilityType === "office" ? "Thêm điểm giao dịch" : "Thêm điểm tập kết"}
			</Button></div>
			{
				isLoading ? <div className="flex flex-row justify-center"><Spinner/></div>
				: error ? <Info
					icon={<ErrorCircle20Filled/>}
					backgroundColor={tokens.colorStatusDangerBackground2}
					foregroundColor={tokens.colorStatusDangerForeground2}
				>Không thể nhận dữ liệu, vui lòng thử lại.</Info>
				: facilities.length === 0 ? <Body2 italic className="ml-4">
					{page === 1 ? "Không có kết quả." : "Không còn thêm kết quả."}
				</Body2>
				: <div className="flex flex-row overflow-x-scroll"><DataGrid
					columns={columnDefinitions} items={facilities}
					className="flex-1 min-w-[30rem]"
				>
					<DataGridHeader><DataGridRow>
						{({renderHeaderCell}) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
					</DataGridRow></DataGridHeader>
					<DataGridBody>
						{({item, rowId}) => <DataGridRow key={rowId} onClick={() => {
							router.push(`/dashboard/facilities/${item.id}`);
						}} className="cursor-pointer">
							{({renderCell}) => <DataGridCell>
								<span className="break-words overflow-auto">{renderCell(item)}</span>
							</DataGridCell>}
						</DataGridRow>}
					</DataGridBody>
				</DataGrid></div>
			}
			<div className="flex flex-row">
				<div className="flex-1 flex flex-row">
					<div className="mr-2"><Button
						icon={<ChevronLeftFilled/>}
						disabled={isLoading || error !== undefined || page === 1}
						onClick={() => {
							setPage(page - 1);
							setUpdatingImmediately(true);
						}}
					>Trang trước</Button></div>
					<div><Button
						icon={<ChevronRightFilled/>} iconPosition="after"
						disabled={isLoading || error !== undefined || facilities.length === 0}
						onClick={() => {
							setPage(page + 1);
							setUpdatingImmediately(true);
						}}
					>Trang sau</Button></div>
				</div>
				<div ref={goToTopButtonRef}><Tooltip relationship="label" content="Đi lên trên cùng">
					<Button icon={<ArrowUpRegular/>} onClick={() => {
						goToBottomButtonRef.current.scrollIntoView({block: "center"});
					}}/>
				</Tooltip></div>
			</div>
		</Card>
		<Dialog open={isCreationDialogOpen} onOpenChange={(_, {open}) => {
			if (!open && isOperationInProgress) return;
			setCreationDialogOpen(false);
		}}>
			<DialogSurface><DialogBody>
				<DialogTitle>{facilityType === "office" ? "Tạo điểm giao dịch" : "Tạo điểm tập kết"}</DialogTitle>
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
						label="Huyện hoặc quận" required className="mb-2"
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
						validationMessage={addressValid ? null : "Cần được xác định."}
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
						onClick={createFacility}
						disabled={!(
							nameValid && cityValid && districtValid && addressValid
							&& (facilityType === "warehouse" || warehouseIdValid)
						) || isOperationInProgress}
					>Tạo</Button>
				</DialogActions>
			</DialogBody></DialogSurface>
		</Dialog>
	</>;
}