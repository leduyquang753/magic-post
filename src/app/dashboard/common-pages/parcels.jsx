"use client";

import {useEffect, useRef, useState} from "react";
import useSWR from "swr";
import {QrScanner} from "@yudiel/react-qr-scanner";

import {
	Accordion,
	AccordionHeader,
	AccordionItem,
	AccordionPanel,
	Body1,
	Body2,
	Button,
	Caption1,
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
	ToggleButton,
	Tooltip,
	createTableColumn,
	makeStyles,
	tokens
} from "@fluentui/react-components";
import {
	ArrowClockwiseRegular,
	ArrowDownRegular,
	ArrowUpRegular,
	CheckmarkFilled,
	ChevronLeftFilled,
	ChevronRightFilled,
	DismissFilled,
	ErrorCircle20Filled,
	QrCodeFilled,
	Search24Regular
} from "@fluentui/react-icons";

import DashboardPageTitle from "@/common/dashboard-page-title";
import Formatter from "@/common/formatter";
import Info from "@/common/info";
import {apiUrl} from "@/common/config";
import formatStatusUpdate from "@/common/status-update";

const useStyles = makeStyles({
	filterButton: {
		display: "inline-block",
		marginBottom: "0.5em",
		"&:not(:last-child)": {
			marginRight: "0.5em"
		}
	}
});

const columnDefinitions = [
	createTableColumn({
		columnId: "number",
		renderHeaderCell: () => "Mã",
		renderCell: item => item.id
	}),
	createTableColumn({
		columnId: "type",
		renderHeaderCell: () => "Loại",
		renderCell: item => item.orderType === "hanghoa" ? "Hàng hóa" : "Tài liệu"
	}),
	createTableColumn({
		columnId: "status",
		renderHeaderCell: () => "Trạng thái",
		renderCell: item => formatStatusUpdate(item.status.at(-1))
	}),
	createTableColumn({
		columnId: "lastUpdate",
		renderHeaderCell: () => "Cập nhật cuối",
		renderCell: item => Formatter.formatDate(item.status.at(-1).time)
	})
];

const filters = ["Arriving", "Processing", "Departed", "Returned", "Discarded"];
function getFilters(flags) {
	return filters.filter((filter, index) => flags[index]);
}

async function getParcels([url, searchText, startDate, endDate, resultsPerPage, page, filters]) {
	const params = {limit: resultsPerPage, page};
	if (searchText.length !== 0) params.searchValue = searchText;
	if (startDate.length !== 0) params.from = startDate;
	if (endDate.length !== 0) params.to = endDate;
	if (filters.length !== 0) params.filter = JSON.stringify(filters);
	const response = await fetch(url + "?" + new URLSearchParams(params), {credentials: "include"});
	return await response.json();
}

export default function ParcelsPage({isOffice}) {
	useEffect(() => { document.title = "Các gói hàng | Magic Post"; }, [true]);
	
	const [searchTuple, setSearchTuple] = useState(["", "", "", "50", 1, []]);
	const [updatingImmediately, setUpdatingImmediately] = useState(false);
	const [isScannerOpen, setScannerOpen] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [resultsPerPage, setResultsPerPage] = useState("50");
	const [filters, setFilters] = useState([false, false, false, false, false]);
	const [page, setPage] = useState(1);
	
	const [isParcelOpen, setParcelOpen] = useState(false);
	const [selectedParcel, setSelectedParcel] = useState(null);
	const [isOperationInProgress, setOperationInProgress] = useState(false);
	const [isOperationFailed, setOperationFailed] = useState(false);

	const filterChangeHandler = index => {
		return checked => { setFilters(filters.with(index, checked)); };
	};
	
	const {data: parcels, error, isLoading, mutate} = useSWR(
		[`${apiUrl}/search/order`, ...searchTuple], getParcels, {revalidateOnFocus: false}
	);
	
	useEffect(() => {
		if (updatingImmediately) {
			setSearchTuple([searchText, startDate, endDate, resultsPerPage, page, getFilters(filters)]); 
			return;
		}
		const timeoutId = setTimeout(() => {
			setPage(1);
			setSearchTuple([searchText, startDate, endDate, resultsPerPage, 1, getFilters(filters)]);
		}, 500);
		return () => clearTimeout(timeoutId);
	}, [searchText, startDate, endDate, resultsPerPage, page, filters]);
	useEffect(() => { if (updatingImmediately) setUpdatingImmediately(false); }, [updatingImmediately]);
	
	const performAction = async key => {
		try {
			setOperationInProgress(true);
			await fetch(apiUrl + selectedParcel.action[key], {method: "POST", credentials: "include"});
			setParcelOpen(false);
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
		<DashboardPageTitle>Danh sách gói hàng</DashboardPageTitle>
		<div className="mb-2"><Button
			appearance="primary" icon={<QrCodeFilled/>}
			onClick={event => { event.preventDefault(); setScannerOpen(true); }}
		>Quét mã QR</Button></div>
		<Card className="mb-4">
			<Accordion collapsible>
				<AccordionItem value="main">
					<AccordionHeader>
						<Search24Regular className="mr-2"/>
						<span className="flex-1">Tìm kiếm gói hàng</span>
					</AccordionHeader>
					<AccordionPanel>
						<Field label="Mã gói hàng" className="mb-4">
							<Input type="text" value={searchText} onChange={(_, {value}) => { setSearchText(value); }}/>
						</Field>
						<div className="mb-2"><Label>Thời gian cập nhật cuối</Label></div>
						<Field label="Từ" orientation="horizontal" className="max-w-lg mb-2"><Input
							type="date"
							value={startDate} onChange={(_, {value}) => { setStartDate(value); }}
						/></Field>
						<Field label="Đến" orientation="horizontal" className="max-w-lg"><Input
							type="date"
							value={endDate} onChange={(_, {value}) => { setEndDate(value); }}
						/></Field>
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
				<div className="flex-1">
					<FilterButton
						checked={filters.every(filter => !filter)}
						onChange={checked => { if (checked) setFilters([false, false, false, false, false]); }}
					>Tất cả</FilterButton>
					<FilterButton checked={filters[0]} onChange={filterChangeHandler(0)}>Đang đến</FilterButton>
					<FilterButton checked={filters[1]} onChange={filterChangeHandler(1)}>Đang xử lí</FilterButton>
					<FilterButton checked={filters[2]} onChange={filterChangeHandler(2)}>Đã đi</FilterButton>
					{isOffice && <>
						<FilterButton checked={filters[3]} onChange={filterChangeHandler(3)}>Đã trả</FilterButton>
						<FilterButton checked={filters[4]} onChange={filterChangeHandler(4)}>Đã hủy</FilterButton>
					</>}
				</div>
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
			{
				isLoading ? <div className="flex flex-row justify-center"><Spinner/></div>
				: error ? <Info
					icon={<ErrorCircle20Filled/>}
					backgroundColor={tokens.colorStatusDangerBackground2}
					foregroundColor={tokens.colorStatusDangerForeground2}
				>Không thể nhận dữ liệu, vui lòng thử lại.</Info>
				: parcels.length === 0 ? <Body2 italic className="ml-4">
					{page === 1 ? "Không có kết quả." : "Không còn thêm kết quả."}
				</Body2>
				: <div className="flex flex-row overflow-x-scroll"><DataGrid
					columns={columnDefinitions} items={parcels} className="flex-1 min-w-[40rem]"
				>
					<DataGridHeader><DataGridRow>
						{({renderHeaderCell}) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
					</DataGridRow></DataGridHeader>
					<DataGridBody>
						{({item, rowId}) => <DataGridRow key={rowId} onClick={() => {
							setSelectedParcel(item);
							setParcelOpen(true);
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
						disabled={isLoading || error !== undefined || parcels.length === 0}
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
		<Dialog open={isScannerOpen} onOpenChange={(_, {open}) => { setScannerOpen(open); }}>
			<DialogSurface><DialogBody>
				<DialogTitle>Quét mã QR</DialogTitle>
				<DialogContent>
					<QrScanner
						stopDecoding={!isScannerOpen}
						onDecode={result => { setSearchText(result); setScannerOpen(false); }}
						onError={() => {}}
					/>
				</DialogContent>
				<DialogActions>
					<DialogTrigger disableButtonEnhancement>
						<Button appearance="secondary">Hủy</Button>
					</DialogTrigger>
				</DialogActions>
			</DialogBody></DialogSurface>
		</Dialog>
		<Dialog open={isParcelOpen} onOpenChange={(_, {open}) => {
			if (!open && isOperationInProgress) return;
			setParcelOpen(open);
		}}>
			<DialogSurface>{selectedParcel !== null && <DialogBody>
				<DialogTitle>Gói hàng {selectedParcel.id}</DialogTitle>
				<DialogContent>
					<div className="mb-4">
						<ParcelActions
							type={selectedParcel.action.type} 
							onSuccess={() => { performAction("successAction"); }}
							onFailed={() => { performAction("failedAction"); }}
							disabled={isOperationInProgress}
						/>
					</div>
					<div><Body1>Người gửi: {selectedParcel.sender}</Body1></div>
					<div><Caption1>{selectedParcel.senderAddress}</Caption1></div>
					<div><Body1>Người nhận: {selectedParcel.receiver}</Body1></div>
					<div><Caption1>{selectedParcel.receiverAddress}</Caption1></div>
					<div><Body1>
						Loại hàng gửi: {selectedParcel.orderType === "hanghoa" ? "hàng hóa" : "tài liệu"}
					</Body1></div>
					{selectedParcel.orderType === "hanghoa" && <div><Body1>
						Khối lượng: {Formatter.formatNumber(selectedParcel.weight)} g
					</Body1></div>}
					<div><Body1>Ngày giờ gửi: {Formatter.formatDate(selectedParcel.arriveAt)}</Body1></div>
				</DialogContent>
				<DialogActions>
					<DialogTrigger disableButtonEnhancement>
						<Button appearance="secondary">Đóng</Button>
					</DialogTrigger>
				</DialogActions>
			</DialogBody>}</DialogSurface>
		</Dialog>
	</>;
}

function FilterButton({children, checked, onChange}) {
	const classes = useStyles();
	return <span className={classes.filterButton}><ToggleButton
		shape="circular" icon={checked ? <CheckmarkFilled/> : null}
		checked={checked} onClick={() => { onChange(!checked); }}
	>{children}</ToggleButton></span>
}

function ParcelActions({type, onSuccess, onFailed, disabled}) {
	switch (type) {
		case "transfer": return <Button
			appearance="primary" icon={<CheckmarkFilled/>} onClick={onSuccess} disabled={disabled}
		>Đã chuyển đi</Button>;
		case "accept": return <Button
			appearance="primary" icon={<CheckmarkFilled/>} onClick={onSuccess} disabled={disabled}
		>Đã tiếp nhận</Button>;
		case "startShipping": return <Button
			appearance="primary" icon={<CheckmarkFilled/>} onClick={onSuccess} disabled={disabled}
		>Đã bắt đầu giao</Button>;
		case "finishShipping": return <>
			<span class="mr-2"><Button
				appearance="primary" icon={<CheckmarkFilled/>} onClick={onSuccess} disabled={disabled}
			>Giao thành công</Button></span>
			<span><Button
				appearance="secondary" icon={<DismissFilled/>} onClick={onFailed} disabled={disabled}
			>Giao thất bại</Button></span>
		</>;
		case "return": return <>
			<span class="mr-2"><Button
				appearance="primary" icon={<CheckmarkFilled/>} onClick={onSuccess} disabled={disabled}
			>Đã trả lại</Button></span>
			<span><Button
				appearance="secondary" icon={<DismissFilled/>} onClick={onFailed} disabled={disabled}
			>Đã tiêu hủy</Button></span>
		</>;
		default: return null;
	}
}