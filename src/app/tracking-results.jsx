import {useEffect, useRef} from "react";

import {
	Body1,
	Button,
	Subtitle1,
	Title2,
	tokens
} from "@fluentui/react-components";
import {ArrowUpFilled} from "@fluentui/react-icons";

import {brandColors} from "@/common/theme";

const envelopeColor0 = "rgba(0, 0, 0, 0)";
const envelopeColor1 = brandColors.base;
const envelopeColor2 = "#0EA5E9"; // Tailwind's sky 500.

export function TrackingResults({data}) {
	const events = [...data.statusEvents];
	const lastEvent = events.pop();
	events.reverse();

	const resultsRef = useRef(null);
	useEffect(() => { resultsRef.current.scrollIntoView({behavior: "smooth"}); }, [data]);
	
	return <div className="w-full">
		<div className="w-full h-4" style={{backgroundImage: "repeating-linear-gradient("
			+ "-45deg,"
			+ `${envelopeColor1}, ${envelopeColor1} 1em,`
			+ `${envelopeColor0} 1em, ${envelopeColor0} 2em,`
			+ `${envelopeColor2} 2em, ${envelopeColor2} 3em,`
			+ `${envelopeColor0} 3em, ${envelopeColor0} 4em,`
			+ `${envelopeColor1} 4em`
		+ ")"}}/>
		<div className="mx-auto p-16 w-full max-w-screen-xl" ref={resultsRef}>
			<div className="ml-auto w-fit">
				<Button appearance="transparent" icon={<ArrowUpFilled/>} onClick={() => {
					window.scrollTo({top: 0, behavior: "smooth"});
					document.getElementById("tracking-number-input").focus();
				}}>Theo dõi gói hàng khác</Button>
			</div>
			<Subtitle1 as="h1" block={true} className="mb-4">Gói hàng {data.parcelNumber}</Subtitle1>
			<ul>
				<TopStatusEvent data={{
					...lastEvent,
					hasNext: events.length !== 0
				}} key={0}/>
				{events.map((e, i) => <SubsequentStatusEvent data={{...e, hasNext: i !== events.length - 1}} key={i}/>)}
			</ul>
		</div>
	</div>;
}

function TopStatusEvent({data}) {
	return <li className="flex flex-row items-stretch">
		<div className="flex flex-col w-12 mr-4">
			<img src="/icon.svg" className="w-12 h-12"/>
			{data.hasNext && <div className="flex-1 w-1 mt-2 self-center bg-gray-400"/>}
		</div>
		<div className="flex flex-col flex-1 pb-12">
			<Title2 className="mt-1 mb-1">{data.message}</Title2>
			<Body1>{data.date}</Body1>
		</div>
	</li>;
}

function SubsequentStatusEvent({data}) {
	return <li className="flex flex-row items-stretch">
		<div className="flex flex-col w-12 mr-4">
			<div className="w-12 text-center" style={{lineHeight: tokens.lineHeightBase500}}>
				<div
					className="inline-block w-4 h-4 align-middle rounded-full"
					style={{backgroundImage: "radial-gradient("
						+ "circle at center,"
						+ "rgba(0, 0, 0, 0), rgba(0, 0, 0, 0) 33%,"
						+ `${brandColors.base} calc(33% + 1px), ${brandColors.base}`
					+ ")"}}
				/>
			</div>
			{data.hasNext && <div className="flex-1 w-1 mt-1 self-center bg-gray-400"/>}
		</div>
		<div className="flex flex-col flex-1 pb-12">
			<Subtitle1 className="mb-1">{data.message}</Subtitle1>
			<Body1>{data.date}</Body1>
		</div>
	</li>;
}