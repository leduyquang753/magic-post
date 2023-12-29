"use client";

import {createMedia} from "@artsy/fresnel";

import Link from "next/link";
import {useRouter, useSelectedLayoutSegments} from "next/navigation";
import {useContext, useState} from "react";
import {useMediaQuery} from "react-responsive";
import {
	Body2,
	Button,
	DrawerHeader,
	DrawerHeaderTitle,
	DrawerBody,
	InlineDrawer,
	OverlayDrawer,
	Popover,
	PopoverSurface,
	PopoverTrigger,
	Subtitle1,
	Tab,
	TabList,
	tokens
} from "@fluentui/react-components";
import {
	DismissFilled,
	NavigationFilled,
	Person20Filled
} from "@fluentui/react-icons";

import AccountStatusContext from "@/common/account-status-context";
import {NavigationContext} from "./navigation-context";
import {apiUrl} from "@/common/config";

const {MediaContextProvider, Media} = createMedia({breakpoints: {
	tn: 0,
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536
}});

export function Scaffold({children, role, navigationContent}) {
	const [drawerOpen, setDrawerOpen] = useState(false);
	useMediaQuery({minWidth: 1024}, undefined, isLargeScreen => {
		if (isLargeScreen) setDrawerOpen(false);
	});
	return <MediaContextProvider><div className="flex flex-col w-screen h-screen">
		<TopBar setOpen={setDrawerOpen}/>
		<div className="flex-1 flex flex-row items-stretch min-h-0">
			<NavigationDrawer
				role={role} navigationContent={navigationContent} open={drawerOpen} setOpen={setDrawerOpen}
			/>
			<BodyContainer>
				{children}
			</BodyContainer>
		</div>
	</div></MediaContextProvider>;
}

function TopBar({setOpen}) {
	return <div className="flex flex-row items-center z-10" style={{
		backgroundColor: tokens.colorNeutralBackground1,
		boxShadow: tokens.shadow4
	}}>
		<Media lessThan="lg">
			<div className="ml-4"><Button
				size="large" appearance="transparent" icon={<NavigationFilled/>}
				onClick={() => { setOpen(true); }}
			/></div>
		</Media>
		<Logo/>
		<div className="flex-1"/>
		<CurrentUser/>
	</div>;
}

function Logo() {
	return <Link href="/" prefetch={false} className="flex flex-row items-center">
		<img src="/icon.svg" className="w-8 my-4 ml-4 mr-2"/>
		<Media greaterThanOrEqual="sm">
			<div className="my-auto text-3xl leading-none italic text-brand-base select-none">Magic Post</div>
		</Media>
	</Link>;
}

function CurrentUser() {
	const router = useRouter();
	const accountStatus = useContext(AccountStatusContext);
	return <Popover withArrow>
		<PopoverTrigger><div className="m-2 p-2 flex flex-row items-center rounded-md hover:bg-gray-100 duration-300">
			<Person20Filled className="mr-2"/>
			<Body2 as="span">{accountStatus.fullName}</Body2>
		</div></PopoverTrigger>
		<PopoverSurface className="flex flex-col items-stretch">
			<div className="mb-4"><Subtitle1 as="h6">Tùy chọn người dùng</Subtitle1></div>
			<div className="mb-2"><Button className="w-full" onClick={() => { router.push("/account"); }}>
				Đến trang tài khoản
			</Button></div>
			<div><Button appearance="subtle" className="w-full" onClick={async () => {
				const response = await fetch(`${apiUrl}/logout`, {method: "GET", credentials: "include"});
				router.push("/");
				router.refresh();
			}}>Đăng xuất</Button></div>
		</PopoverSurface>
	</Popover>;
}

function NavigationDrawer({role, navigationContent, open, setOpen}) {
	const router = useRouter();
	// When currently in a subpage none of the navigation entries will be highlighted.
	const segments = useSelectedLayoutSegments(role);
	const currentPage = segments.length === 2 ? segments[1] : "";
	const drawerContent = <DrawerBody className="py-4 overflow-y-scroll">
		<NavigationContext.Provider value={currentPage}><TabList
		vertical size="large"
		selectedValue={currentPage}
		onTabSelect={(_, {value}) => {
			if (value !== currentPage) router.push(`/dashboard/${value}`);
			setOpen(false);
		}}
	>
		{navigationContent}
		</TabList></NavigationContext.Provider>
	</DrawerBody>;
	return <>
		<Media lessThan="lg" className="flex flex-row items-stretch">
			<OverlayDrawer open={open} onOpenChange={(event, {newOpen}) => { setOpen(newOpen); }}>
				<DrawerHeader>
					<DrawerHeaderTitle action={
						<Button appearance="subtle" icon={<DismissFilled/>} onClick={() => { setOpen(false); }}/>
					}>Điều hướng</DrawerHeaderTitle>
				</DrawerHeader>
				{drawerContent}
			</OverlayDrawer>
		</Media>
		<Media greaterThanOrEqual="lg" className="flex flex-row items-stretch">
			<InlineDrawer open={true}>
				{drawerContent}
			</InlineDrawer>
		</Media>
	</>;
}

function BodyContainer({children}) {
	return <div className="flex-1 p-6 lg:p-12 overflow-y-scroll" style={{
		backgroundColor: tokens.colorNeutralBackground3
	}}>
		{children}
	</div>;
}