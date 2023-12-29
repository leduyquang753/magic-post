import {
	createDarkTheme,
	createLightTheme
} from "@fluentui/react-components";

export const brandColors = { 
	base: "#FF5D1E",
	10: "#080101",
	20: "#2A0E0F",
	30: "#491016",
	40: "#60111A",
	50: "#78121C",
	60: "#90151D",
	70: "#A71B1E",
	80: "#BD251D",
	90: "#D2311C",
	100: "#E6401B",
	110: "#F7521B",
	120: "#FF6B2C",
	130: "#FF884B",
	140: "#FFA169",
	150: "#FFB789",
	160: "#FFCDA9"
};

export const lightTheme = {
	...createLightTheme(brandColors), 
};

export const darkTheme = {
	...createDarkTheme(brandColors), 
};

darkTheme.colorBrandForeground1 = brandColors[110];
darkTheme.colorBrandForeground2 = brandColors[120];