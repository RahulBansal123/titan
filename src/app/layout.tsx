import type { Metadata } from "next";
import "./globals.css";
import { ApplicationLayout } from "./application-layout";

export const metadata: Metadata = {
	title: {
		template: "%s - Titan",
		default: "Titan",
	},
	description: "",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className="w-full h-full text-zinc-950 antialiased lg:bg-zinc-100  dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950"
		>
			<body className="h-full w-full">
				<ApplicationLayout>{children}</ApplicationLayout>
			</body>
		</html>
	);
}
