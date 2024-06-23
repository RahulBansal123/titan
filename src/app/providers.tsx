"use client";

import * as React from "react";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { StarknetWalletConnectors } from "@dynamic-labs/starknet";
import { addUserAction } from "@/lib/actions/user";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<DynamicContextProvider
			settings={{
				environmentId: "eaa21fe8-3df4-4233-8113-b231155ad02c",
				walletConnectors: [StarknetWalletConnectors],
				events: {
					onAuthSuccess: async (event) => {
						if (event.primaryWallet) addUserAction(event.primaryWallet.address);
					},
				},
			}}
			theme="dark"
		>
			{children}
			<Toaster />
		</DynamicContextProvider>
	);
}
