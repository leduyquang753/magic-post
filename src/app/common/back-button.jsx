"use client";

import {
	Button,
	makeStyles
} from "@fluentui/react-components";
import {ChevronLeftFilled} from "@fluentui/react-icons";

const useStyles = makeStyles({
	backButton: {
		paddingLeft: "0",
		paddingRight: "0"
	}
});

export default function BackButton({children}) {
	const classes = useStyles();
	return <Button appearance="transparent" size="large" icon={<ChevronLeftFilled/>} className={classes.backButton}>
		{children}
	</Button>
}