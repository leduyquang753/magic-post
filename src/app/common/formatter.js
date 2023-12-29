import {format as originalFormatDate} from "date-fns";

function formatNumber(number, fractionDigits=0, alwaysUseGrouping=false) {
	const raw = new Intl.NumberFormat("vi-VN", {
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
		useGrouping: false
	}).format(number);
	let separatorPosition = raw.indexOf(',');
	if (separatorPosition === -1) separatorPosition = raw.length;
	if (!alwaysUseGrouping && separatorPosition < 5) return raw;
	let position = separatorPosition % 3;
	if (position === 0) position = 3;
	let result = raw.substring(0, position);
	for (; position !== separatorPosition; position += 3) result += " " + raw.substring(position, position + 3);
	return result + raw.substring(separatorPosition);
}

function formatDate(date) {
	return originalFormatDate(new Date(date), "H'h'mm | d/M/yyyy");
}

export default {
	formatDate,
	formatNumber
};