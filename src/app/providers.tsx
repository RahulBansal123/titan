"use client";

import * as React from "react";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { StarknetWalletConnectors } from "@dynamic-labs/starknet";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "eaa21fe8-3df4-4233-8113-b231155ad02c",
        walletConnectors: [StarknetWalletConnectors],
      }}
      theme="dark"
    >
      {children}
    </DynamicContextProvider>
  );
}
