import QRCodeSVG from "qrcode.react";

import Formatter from "@/common/formatter";

function formatCost(number) {
	return Formatter.formatNumber(number, 0, true) + " đ";
}

export function OrderReceipt({data}) {
	const isGoods = data.parcelType === "goods";
	return <div className="absolute w-full h-full p-8 flex flex-col font-sans">
		<div className="flex flex-row items-center">
			<div className="flex-1 flex flex-row items-center">
				<img src="/icon.svg" className="w-12 mr-4"/>
				<div className="my-auto text-5xl leading-none italic text-brand-base select-none">Magic Post</div>
			</div>
			<div className="flex flex-col items-center">
				<QRCodeSVG value={data.parcelNumber} level="Q" style={{width: "4em", height: "4em"}}/>
				<div className="font-mono">{data.parcelNumber}</div>
			</div>
		</div>
		<div className="flex-1 grid grid-rows-[min-content] grid-cols-2 border-black border-solid border-4">
			<div className="row-start-1 col-start-1 border-black border-solid border-b-2 border-r-2 p-1">
				<div className="font-bold">1. Họ tên, địa chỉ người gửi</div>
				<div>
					{data.senderName}<br/>
					{data.senderAddress}
				</div>
				<div className="mt-3">
					<b>Mã số điểm:</b> {data.sendingOfficeId}
				</div>
			</div>
			<div className="row-start-1 col-start-2 border-black border-solid border-b-2 p-1">
				<div className="font-bold">2. Họ tên, địa chỉ người nhận</div>
				<div>
					{data.receiverName}<br/>
					{data.receiverAddress}
				</div>
				<div className="mt-3">
					<b>Mã số điểm:</b> {data.receivingOfficeId}
				</div>
			</div>
			<div className="row-start-2 col-start-1 flex flex-col">
				<div className="border-black bolor-solid border-b-2 border-r-2">
					<div className="p-1">
						<b>3. Loại hàng gửi:</b> {isGoods ? "hàng hóa" : "tài liệu"}
					</div>
					{isGoods && <div className="flex flex-col items-stretch [&_td]:px-1">
						<div className="font-bold p-1">4. Nội dung bưu gửi</div>
						<table className="border-collapse">
							<thead className="bg-gray-200 font-bold"><tr className="border-black border-t">
								<th className="border-black border-r">Tên</th>
								<th className="border-black border-r">Số lượng</th>
								<th className="border-black border-r">Trị giá</th>
								<th>Giấy tờ</th>
							</tr></thead>
							<tbody>{data.items.map((item, index) => <tr key={index} className="border-black border-t">
								<td className="border-black border-r">{item.name}</td>
								<td className="border-black border-r text-right">{item.quantity}</td>
								<td className="border-black border-r text-right">{formatCost(item.value)}</td>
								<td>{item.documents}</td>
							</tr>)}</tbody>
						</table>
					</div>}
				</div>
				<div className="border-black border-solid border-r-2 p-1">
					<div className="font-bold">{isGoods ? "5" : "4"}. Cam kết của người gửi</div>
					<div>
						Tôi chấp nhận các điều khoản chuyển phát và cam đoan bưu gửi này không chứa những mặt hàng nguy
						hiểm, cấm gửi. Trường hợp không phát được tôi sẽ trả cước chuyển hoàn, nếu không nhận lại trong
						vòng 30 ngày bưu gửi sẽ được tiêu hủy.
					</div>
				</div>
				<div className="flex-1 flex flex-row border-black border-solid border-r-2 p-1">
					<div className="flex-1">
						<div className="font-bold">{isGoods ? "6" : "5"}. Ngày giờ gửi:</div>
						<div>{Formatter.formatDate(data.creationDate)}</div>
					</div>
					<div className="flex-1 font-bold">
						{isGoods ? "7" : "6"}. Chữ kí người gửi
					</div>
				</div>
			</div>
			<div className="row-start-2 col-start-2 flex flex-col">
				<div className="flex flex-row border-black border-solid border-b-2">
					<div className="flex-[2] flex flex-col border-black border-solid border-r-2">
						{isGoods && <div className="border-black border-solid border-b-2 p-1">
							<div className="font-bold">8. Khối lượng bưu gửi:</div>
							<div>{Formatter.formatNumber(data.weight)} g</div>
						</div>}
						<div className="border-black border-solid p-1">
							<div className="font-bold">{isGoods ? "9" : "7"}. Chú dẫn nghiệp vụ:</div>
							<div>
								{data.additionalNotes === null || data.additionalNotes.length === 0
								? "[Không.]"
								: data.additionalNotes}
							</div>
						</div>
					</div>
					<div className="flex-[3] p-1">
						<div className="font-bold">{isGoods ? "10" : "8"}. Cước</div>
						<div className="grid grid-cols-2 [&>:nth-child(even)]:text-right">
							<div>a) Cước chính</div><div>{formatCost(data.shippingCost)}</div>
							<div>b) Phụ phí</div><div>{formatCost(data.otherCost)}</div>
							<div>c) Tổng cước</div><div>{formatCost(data.costBeforeTax)}</div>
							<div>d) Thuế GTGT</div><div>{formatCost(data.tax)}</div>
							<div className="font-bold">e) Tổng thu</div>
							<div className="font-bold">{formatCost(data.totalCost)}</div>
						</div>
					</div>
				</div>
				<div className="flex-1 flex flex-row">
					<div className="flex-1 border-black border-solid border-r-2 p-1">
						<div className="font-bold">{isGoods ? "11" : "9"}. Chữ kí GDV nhận</div>
					</div>
					<div className="flex-1 p-1">
						<div className="font-bold">{isGoods ? "12" : "10"}. Ngày giờ nhận:</div>
						<span className="inline-block w-8 border-gray-200 border-b"/> h{" "}
						<span className="inline-block w-8 border-gray-200 border-b"/> ngày{" "}
						<span className="inline-block w-8 border-gray-200 border-b"/> /{" "}
						<span className="inline-block w-8 border-gray-200 border-b"/> /{" "}
						20<span className="inline-block w-8 border-gray-200 border-b"/>
						<div className="mt-2 text-center">
							<div className="font-bold">Người nhận</div>
							<div>(Kí và ghi rõ họ tên)</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>;
}