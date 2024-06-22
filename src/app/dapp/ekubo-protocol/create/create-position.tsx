"use client";

import { Subheading } from "@/components/catalyst/heading";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from "@/components/catalyst/dropdown";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { IToken } from "../page";
import { useState } from "react";

export const CreatePosition = ({ tokens }: { tokens: IToken[] }) => {
  const [token0, setToken0] = useState<IToken | null>(null);
  const [token1, setToken1] = useState<IToken | null>(null);

  const { primaryWallet } = useDynamicContext();

  return (
    <>
      {primaryWallet?.authenticated ? (
        <div className="mt-6">
          <Dropdown>
            <DropdownButton outline>
              Options
              <ChevronDownIcon />
            </DropdownButton>
            <DropdownMenu>
              {tokens.map((token) => (
                <DropdownItem key={token.name} onClick={() => setToken0(token)}>
                  {token.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      ) : (
        <Subheading className="mt-8">
          Please connect your wallet to create a position.
        </Subheading>
      )}
    </>
  );
};
