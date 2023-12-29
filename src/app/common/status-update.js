function formatFacilityName(update) {
	return (
		`${update.position.slice(0, 2) === "GD" ? "điểm giao dịch" : "điểm tập kết"} `
		+ `${update.name} (${update.position})`
	);
}

export default function formatStatusUpdate(update) {
	switch (update.status) {
		case "accepted":
			return `Gói hàng đã được tiếp nhận tại ${formatFacilityName(update)}.`;
		case "departed":
			return `Gói hàng đang đến ${formatFacilityName(update)}.`;
		case "arrived":
			return `Gói hàng đã đến ${formatFacilityName(update)}.`;
		case "shippingStarted":
			return `Gói hàng đã được mang đi giao.`;
		case "shippingSucceeded":
			return `Gói hàng đã được giao thành công.`;
		case "shippingFailed":
			return `Giao hàng thất bại.`;
		case "returned":
			return `Gói hàng đã được trả lại người gửi.`;
		case "destroyed":
			return `Gói hàng đã bị hủy.`;
	}
}