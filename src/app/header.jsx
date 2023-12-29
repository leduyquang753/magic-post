import {useRouter} from "next/navigation";
import {useEffect, useState, useRef} from "react";
import {QrScanner} from "@yudiel/react-qr-scanner";

import {
	Button,
	Dialog,
	DialogActions,
	DialogBody,
	DialogContent,
	DialogSurface,
	DialogTitle,
	DialogTrigger,
	Input,
	Popover,
	PopoverSurface,
	Spinner,
	Text,
	Tooltip,
	makeStyles,
	tokens
} from "@fluentui/react-components";
import {ArrowRightFilled, QrCodeFilled} from "@fluentui/react-icons";

import Formatter from "@/common/formatter";
import {LoginDialog} from "./login-dialog";
import {apiUrl} from "@/common/config";
import {brandColors} from "@/common/theme";
import formatStatusUpdate from "@/common/status-update";

const parcelNumberPattern = /^DH\d{6}[A-Za-z]{6}$/;
const useStyles = makeStyles({
	loginButton: {
		color: "white",
		":hover": {color: brandColors.base},
		":hover:active": {color: brandColors[90]}
	},
	trackingNumberBox: {
		minWidth: "0"
	}
});

export function Header({className, children}) {
	return <div
		className={"min-h-screen pb-4 bg-center " + className}
		style={{backgroundImage:
			"linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.25) 30%, rgba(0, 0, 0, 0.25)),"
			+ "url(\"/landing-background.jpg\")"
		}}
	>
		{children}
	</div>;
}

export function TopBar({isLoggedIn}) {
	const router = useRouter();
	const classes = useStyles();
	return <div className="flex flex-row p-4">
		<img src="/icon.svg" className="w-12 mr-2"/>
		<div className="flex-1 my-auto text-4xl leading-none italic text-brand-base select-none">Magic Post</div>
		{isLoggedIn
		? <Button
			appearance="transparent" size="large" className={classes.loginButton}
			onClick={() => { router.push("/dashboard"); }}
		>Trang nhân viên</Button>
		: <LoginDialog>
			<Button appearance="transparent" size="large" className={classes.loginButton}>Đăng nhập</Button>
		</LoginDialog>
		}
	</div>;
}

export function TrackingForm({onResultsAvailable, className}) {
	const [parcelNumber, setParcelNumber] = useState("");
	const [isPopoverOpen, setPopoverOpen] = useState(false);
	const [isScannerOpen, setScannerOpen] = useState(false);
	const [isOperationInProgress, setOperationInProgress] = useState(false);

	const getResults = async number => {
		try {
			if (!parcelNumberPattern.test(number)) throw new Error();
			setOperationInProgress(true);
			const response = await fetch(`${apiUrl}/search/orderStatus?` + new URLSearchParams({id: number}));
			if (!response.ok) throw new Error();
			onResultsAvailable({
				parcelNumber,
				statusEvents: (await response.json()).map(update => ({
					date: Formatter.formatDate(update.time),
					message: formatStatusUpdate(update)
				}))
			});
		} catch (error) {
			setPopoverOpen(true);
		} finally {
			setOperationInProgress(false);
		}
	};
	
	const inputRef = useRef(null);
	const popoverPositioningRef = useRef(null);

	useEffect(() => {
		if (inputRef.current && popoverPositioningRef.current)
			popoverPositioningRef.current.setTarget(inputRef.current);
	});

	const classes = useStyles();
	return <div className={"flex flex-col drop-shadow-[0_0_8px_black] items-center " + className}>
		<div className="text-4xl xl:text-6xl font-semibold text-white text-center">
			Theo dõi gói hàng trên đường đến với bạn
		</div>
		<div className="my-4 xl:my-8 text-xl xl:text-3xl text-white text-center">
			Nhập mã theo dõi ở dưới để bắt đầu.
		</div>
		<div
			ref={inputRef}
			className="flex flex-row w-full max-w-screen-sm rounded-full bg-white dark:bg-black p-2"
		>
			<Input
				id="tracking-number-input"
				size="large" appearance="underline" placeholder="Mã theo dõi"
				className={`flex-1 ${classes.trackingNumberBox}`}
				value={parcelNumber} onChange={(_, {value}) => {
					setParcelNumber(value);
					if (isPopoverOpen) setPopoverOpen(false);
				}}
				contentAfter={<Tooltip content="Quét mã QR" relationship="label">
					<Button
						size="large" appearance="subtle" icon={<QrCodeFilled/>}
						onClick={() => { setScannerOpen(true); }}
					/>
				</Tooltip>}
			/>
			<Button
				size="large" appearance="primary" shape="circular"
				icon={isOperationInProgress ? <Spinner size="tiny"/> : <ArrowRightFilled/>} iconPosition="after"
				disabled={parcelNumber.trim().length === 0 || isOperationInProgress}
				onClick={() => { setPopoverOpen(false); getResults(parcelNumber); }}
			>Xem</Button>
		</div>
		<Popover open={isPopoverOpen} size="small" positioning={{
			position: "below",
			offset: 8,
			positioningRef: popoverPositioningRef
		}}>
			<PopoverSurface>
				<Text>
					Đây có vẻ không phải là một mã theo dõi hợp lệ. Vui lòng kiểm tra rằng nó đã được nhập đúng
					và thử lại.
				</Text>
			</PopoverSurface>
		</Popover>
		<Dialog open={isScannerOpen} onOpenChange={(_, {open}) => { setScannerOpen(open); }}>
			<DialogSurface><DialogBody>
				<DialogTitle>Quét mã QR</DialogTitle>
				<DialogContent>
					<QrScanner
						stopDecoding={!isScannerOpen}
						onDecode={result => { setParcelNumber(result); setScannerOpen(false); getResults(result); }}
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
	</div>;
}