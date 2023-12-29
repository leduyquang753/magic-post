import * as ChartJs from "chart.js";
import * as DateFunctions from "date-fns";

let loaded = false;

const formats = {
	datetime: "H'h'mm:ss | d/M/yyyy",
	millisecond: "H'h'mm:ss,SSS",
	second: "H'h'mm:ss",
	minute: "H'h'mm",
	hour: "H'h'",
	day: "d/M/yyyy",
	week: "d/M/yyyy",
	month: "M/yyyy",
	quarter: "M/yyyy",
	year: "yyyy"
};

const adders = {
	millisecond: DateFunctions.addMilliseconds,
	second: DateFunctions.addSeconds,
	minute: DateFunctions.addMinutes,
	hour: DateFunctions.addHours,
	day: DateFunctions.addDays,
	week: DateFunctions.addWeeks,
	month: DateFunctions.addMonths,
	quarter: DateFunctions.addQuarters,
	year: DateFunctions.addYears
};

const subtracters = {
	millisecond: DateFunctions.differenceInMilliseconds,
	second: DateFunctions.differenceInSeconds,
	minute: DateFunctions.differenceInMinutes,
	hour: DateFunctions.differenceInHours,
	day: DateFunctions.differenceInDays,
	week: DateFunctions.differenceInWeeks,
	month: DateFunctions.differenceInMonths,
	quarter: DateFunctions.differenceInQuarters,
	year: DateFunctions.differenceInYears
};

const startGetters = {
	second: DateFunctions.startOfSecond,
	minute: DateFunctions.startOfMinute,
	hour: DateFunctions.startOfHour,
	day: DateFunctions.startOfDay,
	week: DateFunctions.startOfWeek,
	isoWeek: (date) => DateFunctions.startOfWeek(date, {weekStartsOn: 1}),
	month: DateFunctions.startOfMonth,
	quarter: DateFunctions.startOfQuarter,
	year: DateFunctions.startOfYear
};

const endGetters = {
	second: DateFunctions.endOfSecond,
	minute: DateFunctions.endOfMinute,
	hour: DateFunctions.endOfHour,
	day: DateFunctions.endOfDay,
	week: DateFunctions.endOfWeek,
	month: DateFunctions.endOfMonth,
	quarter: DateFunctions.endOfQuarter,
	year: DateFunctions.endOfYear
};

if (!loaded) {
	ChartJs.defaults.font.family = (
		"'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', "
		+ "sans-serif"
	);
	ChartJs.defaults.font.size = 14;

	ChartJs._adapters._date.override({
		formats: () => formats,
		parse: (date, format) => date,
		format: (date, format) => DateFunctions.format(date, format),
		add: (date, amount, unit) => adders[unit](date, amount),
		diff: (date1, date2, unit) => subtracters[unit](date1, date2),
		startOf: (date, unit) => startGetters[unit](date),
		endOf: (date, unit) => endGetters[unit](date)
	});

	loaded = true;
}