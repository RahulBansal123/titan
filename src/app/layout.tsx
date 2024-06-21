import type { Metadata } from "next";
import "./globals.css";
import { ApplicationLayout } from "./application-layout";
import {
	DynamicContextProvider,
	StarknetWalletConnectors,
} from "@/lib/dynamic";

export const metadata: Metadata = {
	title: {
		template: "%s - Titan",
		default: "Titan",
	},
	description: "Manage all your StarkNet positions in one place.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			suppressHydrationWarning
			lang="en"
			className="w-full h-full text-zinc-950 antialiased lg:bg-zinc-100  dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950"
		>
			<DynamicContextProvider
				theme="dark"
				settings={{
					appName: "Titan",
					environmentId: "eaa21fe8-3df4-4233-8113-b231155ad02c",
					walletConnectors: [StarknetWalletConnectors],
				}}
			>
				<body className="h-full w-full">
					<ApplicationLayout>{children}</ApplicationLayout>
				</body>
			</DynamicContextProvider>
		</html>
	);
}
