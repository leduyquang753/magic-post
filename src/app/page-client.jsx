"use client";

import Head from "next/head";
import {useState} from "react";

import {Header, TrackingForm, TopBar} from "./header";
import {TrackingResults} from "./tracking-results";

export function MainPageClient({isLoggedIn}) {
	const [trackingResults, setTrackingResults] = useState(null);
	
	return <>
		<Head>
			<title>Magic Post</title>
		</Head>
		<Header className="flex flex-col">
			<TopBar isLoggedIn={isLoggedIn}/>
			<div className="grow-[3]"/>
			<TrackingForm onResultsAvailable={setTrackingResults} className="px-4 xl:px-16"/>
			<div className="grow-[4]"/>
		</Header>
		{trackingResults !== null && <TrackingResults data={trackingResults}/>}
	</>;
}