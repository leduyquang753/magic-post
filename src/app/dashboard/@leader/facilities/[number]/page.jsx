import {redirect} from "next/navigation";

import FacilityPageContent from "./page-content";

const numberPattern = /^(?:GD|TK)\d{4}$/;

export default function FacilityPage({params}) {
	if (!numberPattern.test(params.number)) redirect("/dashboard/facilities");
	return <FacilityPageContent params={params}/>;
}