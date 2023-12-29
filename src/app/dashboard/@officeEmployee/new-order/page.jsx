"use client";

import {useEffect, useRef, useState} from "react";
import useSWRInfinite from "swr/infinite";

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
	Divider,
	Dropdown,
	Field,
	Input,
	Label,
	Radio,
	RadioGroup,
	Spinner,
	Textarea,
	Tooltip,
	createTableColumn,
	tokens
} from "@fluentui/react-components";
import {
	AddFilled,
	ArrowClockwiseFilled,
	ArrowDownFilled,
	DeleteRegular,
	EditRegular,
	ErrorCircle20Filled,
	PrintFilled,
	Search24Regular
} from "@fluentui/react-icons";
import {useReactToPrint} from "react-to-print";

import DashboardPageTitle from "@/common/dashboard-page-title";
import FormSection from "@/common/form-section";
import Formatter from "@/common/formatter";
import Info from "@/common/info";
import {LocationOptions, useCities, useDistricts} from "@/common/location-components";
import {OrderReceipt} from "./receipt";
import {apiUrl} from "@/common/config";

export default function OfficeNewOrderPage() {
	useEffect(() => { document.title = "Tạo đơn | Magic Post"; }, [true]);
	
	const receipt = useRef(null);
	const printReceipt = useReactToPrint({
		documentTitle: "Biên nhận Magic Post",
		content: () => receipt.current,
		pageStyle: ":root { font-size: 1vw; }"
	});
	
	const [isCreatedDialogOpen, setCreatedDialogOpen] = useState(false);
	const [parcelData, setParcelData] = useState(null);
	const [hasPrintedReceipt, setHasPrintedReceipt] = useState(false);

	const [key, setKey] = useState(0);
	return <>
		<NewOrderForm key={key} onOrderCreated={data => {
			setParcelData(data);
			setHasPrintedReceipt(false);
			setCreatedDialogOpen(true);
		}}/>
		<Dialog open={isCreatedDialogOpen} onOpenChange={(_, {open}) => {
			if (open || !hasPrintedReceipt) return;
			setCreatedDialogOpen(false);
			setKey(key + 1);
			setParcelData(null);
		}}>
			<DialogSurface><DialogBody>
				<DialogTitle>Đơn đã được tạo</DialogTitle>
				<DialogContent>
					{parcelData !== null && <Body1>Mã của gói hàng mới là {parcelData.parcelNumber}.</Body1>}
				</DialogContent>
				<DialogActions fluid>
					<DialogTrigger disableButtonEnhancement>
						<Button appearance="secondary" disabled={!hasPrintedReceipt}>Đóng</Button>
					</DialogTrigger>
					<Button appearance="primary" icon={<PrintFilled/>} onClick={() => {
						printReceipt();
						setHasPrintedReceipt(true);
					}}>In biên nhận</Button>
				</DialogActions>
			</DialogBody></DialogSurface>
		</Dialog>
		{parcelData !== null && <div className="hidden">
			<div ref={receipt}><OrderReceipt data={parcelData}/></div>
		</div>}
	</>;
}

function NewOrderForm({onOrderCreated}) {
	const [senderName, setSenderName] = useState("");
	const [senderAddress, setSenderAddress] = useState("");
	const [receiverName, setReceiverName] = useState("");
	const [receiverAddress, setReceiverAddress] = useState("");
	const [receivingOffice, setReceivingOffice] = useState(null);
	const [parcelType, setParcelType] = useState("goods");
	const [items, setItems] = useState([]);
	const [parcelWeight, setParcelWeight] = useState(0);
	const [additionalNotes, setAdditionalNodes] = useState("");
	const senderNameValid = senderName.trim().length !== 0;
	const senderAddressValid = senderAddress.trim().length !== 0;
	const receiverNameValid = receiverName.trim().length !== 0;
	const receiverAddressValid = receiverAddress.trim().length !== 0;
	const receivingOfficeValid = receivingOffice !== null;
	const itemsValid = parcelType === "documents" || items.length !== 0;
	const parcelWeightValid = parcelType === "documents" || parcelWeight > 0;

	const [isSettingOffice, setSettingOffice] = useState(false);
	
	const [isEditingItem, setEditingItem] = useState(false);
	const [editingItemIndex, setEditingItemIndex] = useState(null);
	const [editingItemName, setEditingItemName] = useState("");
	const [editingItemQuantity, setEditingItemQuantity] = useState(1);
	const [editingItemValue, setEditingItemValue] = useState(0);
	const [editingItemDocuments, setEditingItemDocuments] = useState("");
	const itemNameValid = editingItemName.trim().length !== 0;
	const itemQuantityValid = editingItemQuantity > 0;
	const itemValueValid = editingItemValue >= 0;

	const [isOperationInProgress, setOperationInProgress] = useState(false);
	const [isOperationFailed, setOperationFailed] = useState(false);

	const createOrder = async () => {
		try {
			const response = await fetch(`${apiUrl}/order`, {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				credentials: "include",
				body: JSON.stringify({
					sender: senderName,
					senderAddress: senderAddress,
					receiver: receiverName,
					receiverAddress: receiverAddress,
					receiverTransactionId: receivingOffice.id,
					orderType: parcelType === "goods" ? "hanghoa" : "tailieu",
					orderInfo: JSON.stringify(items),
					weight: parcelWeight === 0 ? 1 : parcelWeight,
					notes: additionalNotes.trim()
				})
			});
			if (!response.ok) throw new Error();
			const data = await response.json();
			const parcelData = {
				parcelNumber: data.id,
				creationDate: data.arriveAt,
				senderName: data.sender,
				senderAddress: data.senderAddress,
				sendingOfficeId: data.senderTransactionId,
				receiverName: data.receiver,
				receiverAddress: data.receiverAddress,
				receivingOfficeId: data.receiverTransactionId,
				parcelType: data.orderType === "hanghoa" ? "goods" : "documents",
				shippingCost: data.price.mainCharge,
				otherCost: data.price.surcharge,
				costBeforeTax: data.price.mainCharge + data.price.surcharge,
				tax: data.price.vat,
				totalCost: data.price.total,
				additionalNotes: data.notes
			};
			if (parcelData.parcelType === "goods") {
				parcelData.items = JSON.parse(data.orderInfo);
				parcelData.weight = data.weight;
			}
			onOrderCreated(parcelData);
			setOperationFailed(false);
		} catch (error) {
			setOperationFailed(true);
		} finally {
			setOperationInProgress(false);
		}
	};

	const columnDefinitions = [
		createTableColumn({
			columnId: "name",
			renderHeaderCell: () => "Tên",
			renderCell: item => item.name
		}),
		createTableColumn({
			columnId: "quantity",
			renderHeaderCell: () => "Số lượng",
			renderCell: item => item.quantity
		}),
		createTableColumn({
			columnId: "value",
			renderHeaderCell: () => "Giá trị",
			renderCell: item => Formatter.formatNumber(item.value) + " đ"
		}),
		createTableColumn({
			columnId: "documents",
			renderHeaderCell: () => "Giấy tờ đi kèm",
			renderCell: item => item.documents.length === 0 ? "Không" : item.documents
		}),
		createTableColumn({
			columnId: "actions",
			renderHeaderCell: () => "Thao tác",
			renderCell: item => <>
				<Tooltip relationship="label" content="Sửa"><Button
					appearance="subtle" shape="circular" icon={<EditRegular/>}
					onClick={() => {
						setEditingItemIndex(item.index);
						setEditingItemName(item.name);
						setEditingItemQuantity(item.quantity);
						setEditingItemValue(item.value);
						setEditingItemDocuments(item.documents);
						setEditingItem(true);
					}}
				/></Tooltip>
				<Tooltip relationship="label" content="Xóa"><Button
					appearance="subtle" shape="circular" icon={<DeleteRegular/>}
					onClick={() => {
						const newItems = items.toSpliced(item.index, 1);
						newItems.forEach((item, index) => { item.index = index; });
						setItems(newItems);
					}}
				/></Tooltip>
			</>
		})
	];
	return <>
		<DashboardPageTitle>Tạo đơn vận chuyển</DashboardPageTitle>
		<Card>
			<FormSection title="Thông tin người gửi">
				<Field
					label="Tên" required className="mb-2"
					validationState={senderNameValid ? "none" : "error"}
					validationMessage={senderNameValid ? null : "Cần có."}
				><Input
					type="text" value={senderName}
					onChange={(_, {value}) => { setSenderName(value); }}
				/></Field>
				<Field
					label="Địa chỉ" required className="mb-2"
					validationState={senderAddressValid ? "none" : "error"}
					validationMessage={senderAddressValid ? null : "Cần có."}
				><Input
					type="text" value={senderAddress}
					onChange={(_, {value}) => { setSenderAddress(value); }}
				/></Field>
			</FormSection>
			<FormSection title="Thông tin người nhận">
				<Field
					label="Tên" required className="mb-2"
					validationState={receiverNameValid ? "none" : "error"}
					validationMessage={receiverNameValid ? null : "Cần có."}
				><Input
					type="text" value={receiverName}
					onChange={(_, {value}) => { setReceiverName(value); }}
				/></Field>
				<Field
					label="Địa chỉ" required className="mb-2"
					validationState={receiverAddressValid ? "none" : "error"}
					validationMessage={receiverAddressValid ? null : "Cần có."}
				><Input
					type="text" value={receiverAddress}
					onChange={(_, {value}) => { setReceiverAddress(value); }}
				/></Field>
				<div className="mb-2"><Label>Điểm giao dịch nhận</Label></div>
				{receivingOffice === null
				? <div><Button appearance="primary" onClick={() => { setSettingOffice(true); }}>
					Đặt điểm giao dịch
				</Button></div>
				: <div className="flex flex-row items-center">
					<div className="mr-2"><Body1>{receivingOffice.id}. {receivingOffice.name}</Body1></div>
					<div><Tooltip relationship="label" content="Đổi điểm giao dịch"><Button
						appearance="subtle" icon={<EditRegular/>} onClick={() => { setSettingOffice(true); }}
					/></Tooltip></div>
				</div>}
			</FormSection>
			<Field label="Loại hàng gửi">
				<RadioGroup layout="horizontal" value={parcelType} onChange={(_, {value}) => { setParcelType(value); }}>
					<Radio value="goods" label="Hàng hóa"/>
					<Radio value="documents" label="Tài liệu"/>
				</RadioGroup>
			</Field>
			{ parcelType === "goods" && <>
				<div><Label>Chi tiết các mặt hàng gửi</Label></div>
				{ items.length === 0
				? <Body2 italic className="ml-4">Chưa liệt kê mặt hàng nào.</Body2>
				: <div className="flex flex-row overflow-x-scroll"><DataGrid
					columns={columnDefinitions} getRowId={item => item.index} items={items}
					className="flex-1 min-w-[50rem]"
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
				<div><Button
					appearance="primary" icon={<AddFilled/>}
					onClick={() => {
						setEditingItemIndex(-1);
						setEditingItemName("");
						setEditingItemQuantity(1);
						setEditingItemValue(0);
						setEditingItemDocuments("");
						setEditingItem(true);
					}}
				>Thêm mặt hàng</Button></div>
				<Field
					orientation="horizontal" label="Khối lượng bưu gửi" className="max-w-lg"
					validationState={parcelWeight > 0 ? "none" : "error"}
					validationMessage={parcelWeight > 0 ? null : "Phải lớn hơn 0 g."}
				>
					<Input
						type="number" min={0} max={100000} step={100} contentAfter="g"
						value={parcelWeight.toString()}
						onChange={(_, {value}) => { setParcelWeight(readIntegerInput(value, parcelWeight)); }}
					/>
				</Field>
			</>}
			<Field label="Chú dẫn nghiệp vụ">
				<Textarea value={additionalNotes} onChange={(_, {value}) => { setAdditionalNodes(value); }}/>
			</Field>
			<Divider appearance="strong"/>
			{isOperationFailed && <Info
				icon={<ErrorCircle20Filled/>}
				backgroundColor={tokens.colorStatusDangerBackground2}
				foregroundColor={tokens.colorStatusDangerForeground2}
			>Không thể tạo đơn. Vui lòng thử lại.</Info>}
			<div className="flex flex-row items-center">
				<Button
					appearance="primary"
					disabled={!(
						senderNameValid && senderAddressValid && receiverNameValid && receiverAddressValid
						&& receivingOfficeValid && itemsValid && parcelWeightValid
					) || isOperationInProgress}
					onClick={createOrder}
				>Tạo đơn</Button>
				{isOperationInProgress && <Spinner size="tiny" className="ml-2"/>}
			</div>
		</Card>
		<Dialog open={isEditingItem} onOpenChange={(_, {open}) => { if (!open) setEditingItem(false); }}>
			<DialogSurface><DialogBody>
				<DialogTitle>{editingItemIndex === -1 ? "Thêm mặt hàng" : "Sửa mặt hàng"}</DialogTitle>
				<DialogContent>
					<Field
						label="Tên" required
						validationState={itemNameValid ? "none" : "error"}
						validationMessage={itemNameValid ? null : "Cần có."}
					><Input
						value={editingItemName}
						onChange={(_, {value}) => { setEditingItemName(value); }}
					/></Field>
					<Field
						label="Số lượng" required
						validationState={itemQuantityValid ? "none" : "error"}
						validationMessage={itemQuantityValid ? null : "Phải không nhỏ hơn 1."}
					><Input
						type="number" min={1}
						value={editingItemQuantity.toString()}
						onChange={(_, {value}) => {
							setEditingItemQuantity(readIntegerInput(value, editingItemQuantity));
						}}
					/></Field>
					<Field
						label="Giá trị" required
						validationState={itemValueValid ? "none" : "error"}
						validationMessage={itemValueValid ? null : "Phải không nhỏ hơn 0."}
					><Input
						type="number" min={0} step={10000} contentAfter="đ"
						value={editingItemValue.toString()}
						onChange={(_, {value}) => {
							setEditingItemValue(readIntegerInput(value, editingItemValue));
						}}
					/></Field>
					<Field label="Giấy tờ đi kèm"><Input
						value={editingItemDocuments}
						onChange={(_, {value}) => { setEditingItemDocuments(value); }}
					/></Field>
				</DialogContent>
				<DialogActions>
					<DialogTrigger disableButtonEnhancement>
						<Button appearance="secondary">Hủy</Button>
					</DialogTrigger>
					<DialogTrigger disableButtonEnhancement>
						<Button appearance="primary" onClick={() => {
							const newItem = {
								name: editingItemName,
								quantity: editingItemQuantity,
								value: editingItemValue,
								documents: editingItemDocuments
							};
							const newItems = editingItemIndex === -1
								? [...items, newItem]
								: items.with(editingItemIndex, newItem);
							newItems.forEach((item, index) => { item.index = index; });
							setItems(newItems);
						}} disabled={
							!(itemNameValid && itemQuantityValid && itemValueValid)
						}>{editingItemIndex === -1 ? "Thêm" : "Lưu"}</Button>
					</DialogTrigger>
				</DialogActions>
			</DialogBody></DialogSurface>
		</Dialog>
		<OfficeSelectionDialog
			open={isSettingOffice} onOpenChange={setSettingOffice} onConfirm={setReceivingOffice}
		/>
	</>;
}

function readIntegerInput(input, defaultNumber) {
	if (input.length === 0) return 0;
	if (!/^\d+$/.test(input)) return defaultNumber;
	const number = Number.parseInt(input);
	return Number.isNaN(number) ? defaultNumber : number;
}

async function getFacilities([url, searchText, cityId, districtId, page]) {
	const params = {limit: 50, page};
	if (searchText.length !== 0) params.searchValue = searchText;
	if (cityId !== "none") params.city = cityId;
	if (districtId !== "none") params.district = districtId;
	const response = await fetch(url + "?" + new URLSearchParams(params), {credentials: "include"});
	return await response.json();
}

function OfficeSelectionDialog({open, onOpenChange, onConfirm}) {
	const [searchTuple, setSearchTuple] = useState(["", "none", "none"]);
	const [updatingImmediately, setUpdatingImmediately] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [cityId, setCityId] = useState("none");
	const [cityName, setCityName] = useState("");
	const [districtId, setDistrictId] = useState("none");
	const [districtName, setDistrictName] = useState("");
	
	const {data: cities} = useCities();
	const {data: districts} = useDistricts(cityId);
	const {data: offices, error, isLoading, size, setSize, mutate} = useSWRInfinite(
		page => [`${apiUrl}/search/transaction`, ...searchTuple, page+1], getFacilities, {revalidateOnFocus: false}
	);
	
	useEffect(() => {
		if (!open) return;
		setSearchText("");
		setCityId("none");
		setCityName("");
		setDistrictId("none");
		setDistrictName("");
		setUpdatingImmediately(true);
	}, [open]);
	useEffect(() => {
		if (updatingImmediately) {
			setSearchTuple([searchText, cityId, districtId]); 
			return;
		}
		const timeoutId = setTimeout(() => {
			setSize(1);
			setSearchTuple([searchText, cityId, districtId]);
		}, 500);
		return () => clearTimeout(timeoutId);
	}, [searchText, cityId, districtId]);
	useEffect(() => { if (updatingImmediately) setUpdatingImmediately(false); }, [updatingImmediately]);
	
	return <Dialog open={open} onOpenChange={(_, {open}) => { onOpenChange(false); }}>
		<DialogSurface><DialogBody className="h-screen">
			<DialogTitle>Đặt điểm giao dịch nhận</DialogTitle>
			<DialogContent className="flex flex-col">
				<div className="flex flex-row items-center mb-2">
					<div className="mr-2"><Search24Regular/></div>
					<Input
						type="text" placeholder="Tìm kiếm" className="flex-1"
						value={searchText} onChange={(_, {value}) => { setSearchText(value); }}
					/>
				</div>
				<div className="flex flex-row">
					<Dropdown
						placeholder="Tỉnh, thành phố" className="flex-1 mr-4"
						positioning={{coverTarget: "true"}}
						value={cityName} selectedOptions={[cityId]}
						onOptionSelect={(_, data) => {
							setCityId(data.selectedOptions[0]);
							setCityName(data.optionText);
							setDistrictId("none");
							setDistrictName("");
						}}
					><LocationOptions entries={cities} withNone/></Dropdown>
					<Dropdown
						placeholder="Quận, huyện" disabled className="flex-1"
						positioning={{coverTarget: "true"}} disabled={cityId === "none"}
						value={districtName} selectedOptions={[districtId]}
						onOptionSelect={(_, data) => {
							setDistrictId(data.selectedOptions[0]);
							setDistrictName(data.optionText);
						}}
					><LocationOptions entries={districts} withNone/></Dropdown>
				</div>
				<div><Divider className="mt-2"/></div>
				<div className="flex-1 overflow-y-scroll">{
					isLoading ? <div className="mt-2 flex flex-row justify-center"><Spinner/></div>
					: error ? <>
						<Info
							icon={<ErrorCircle20Filled/>}
							backgroundColor={tokens.colorStatusDangerBackground2}
							foregroundColor={tokens.colorStatusDangerForeground2}
						>Không thể nhận dữ liệu.</Info>
						<Button appearance="primary" icon={<ArrowClockwiseFilled/>} onClick={() => { mutate(); }}>
							Thử lại
						</Button>
					</> : <>
						{offices.flat(1).map(office => <div
							key={office.id} tabIndex="0"
							className="select-none cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
							onClick={() => {
								onOpenChange(false);
								onConfirm(office);
							}}
							onKeyDown={event => {
								if (event.keyCode !== 13) return;
								onOpenChange(false);
								onConfirm(office);
							}}
						>
							<div className="p-3">
								<div><Body2>{office.id}. {office.name}</Body2></div>
								<div><Body1>{office.address}, {office.district}, {office.city}</Body1></div>
							</div>
							<Divider appearance="subtle"/>
						</div>)}
						{offices.at(-1).length === 0
						? <div className="mt-2 text-center"><Body1 italic>
							{size === 1 ? "Không có kết quả." : "Không còn thêm kết quả."}
						</Body1></div>
						: <div className="mt-2 flex flex-col items-center"><Button
							appearance="subtle" icon={<ArrowDownFilled/>}
							onClick={() => {
								setSize(size + 1);
								setUpdatingImmediately(true);
							}}
						>Tải thêm</Button></div>
						}
					</>
				}</div>
			</DialogContent>
			<DialogActions fluid>
				<DialogTrigger disableButtonEnhancement>
					<Button appearance="secondary">Hủy</Button>
				</DialogTrigger>
			</DialogActions>
		</DialogBody></DialogSurface>
	</Dialog>;
}