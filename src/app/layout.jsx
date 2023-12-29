import "./globals.css";

export const metadata = {
	title: "Magic Post"
};

export default function MainLayout({children}) {
	return <html>
		<body>
			{children}
		</body>
	</html>;
}