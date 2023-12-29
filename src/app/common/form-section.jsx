"use client";

import {
	Body2,
	makeStyles,
	mergeClasses,
	tokens
} from "@fluentui/react-components";

const useStyles = makeStyles({
	topEdge: {
		display: "flex",
		flexDirection: "row",
		alignItems: "stretch",
		paddingTop: "0.75em"
	},
	leftCorner: {
		width: "1em",
		borderTopStyle: "solid",
		borderLeftStyle: "solid",
		borderTopWidth: tokens.strokeWidthThin,
		borderLeftWidth: tokens.strokeWidthThin,
		borderTopColor: tokens.colorNeutralStroke1,
		borderLeftColor: tokens.colorNeutralStroke1,
		borderTopLeftRadius: tokens.borderRadiusXLarge
	},
	title: {
		display: "block",
		marginLeft: "0.5em",
		marginRight: "0.5em",
		translate: "0 -0.75em"
	},
	rightCorner: {
		flexGrow: 1,
		borderTopStyle: "solid",
		borderRightStyle: "solid",
		borderTopWidth: tokens.strokeWidthThin,
		borderRightWidth: tokens.strokeWidthThin,
		borderTopColor: tokens.colorNeutralStroke1,
		borderRightColor: tokens.colorNeutralStroke1,
		borderTopRightRadius: tokens.borderRadiusXLarge
	},
	body: {
		borderBottomStyle: "solid",
		borderLeftStyle: "solid",
		borderRightStyle: "solid",
		borderBottomWidth: tokens.strokeWidthThin,
		borderLeftWidth: tokens.strokeWidthThin,
		borderRightWidth: tokens.strokeWidthThin,
		borderBottomColor: tokens.colorNeutralStroke1,
		borderLeftColor: tokens.colorNeutralStroke1,
		borderRightColor: tokens.colorNeutralStroke1,
		borderBottomLeftRadius: tokens.borderRadiusXLarge,
		borderBottomRightRadius: tokens.borderRadiusXLarge,
		paddingBottom: "1em",
		paddingLeft: "1em",
		paddingRight: "1em"
	}
});

export default function FormSection({title, children}) {
	const classes = useStyles();
	return <div>
		<div className={classes.topEdge}>
			<div className={classes.leftCorner}/>
			<Body2 as="h6" className={classes.title}>{title}</Body2>
			<div className={classes.rightCorner}/>
		</div>
		<div className={classes.body}>{children}</div>
	</div>;
}