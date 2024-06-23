"use client";

import { Subheading } from "@/components/catalyst/heading";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Field, Label } from "@/components/catalyst/fieldset";
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from "@/components/catalyst/dropdown";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Input } from "@/components/catalyst/input";
import clsx from "clsx";
import { Button } from "@/components/catalyst/button";
import { IToken } from "@/types";
import toast from "react-hot-toast";
import { addPosition } from "@/lib/ekubo/add";
import { EKUBO_BASE_URL } from "@/constants/ekubo";

const feeTiers = [
  { name: "0.01% fee and 0.02% precision", value: "0.0001" },
  { name: "0.05% fee and 0.1% precision", value: "0.0005" },
  { name: "0.3% fee and 0.6% precision", value: "0.003" },
  { name: "1% fee and 2% precision", value: "0.01" },
  { name: "5% fee and 10% precision", value: "0.05" },
];

const balances = {
  Ether: 0.01,
  "StarkNet Token": 2,
};

export const CreatePosition = ({ tokens }: { tokens: IToken[] }) => {
  const [token0, setToken0] = useState<IToken>(tokens[0]);
  const [token1, setToken1] = useState<IToken>(tokens[1]);
  const [state, setState] = useState({
    feeTier: feeTiers[0].value,
    minPrice: undefined,
    maxPrice: undefined,
    fromTokenAmount: undefined,
    toTokenAmount: undefined,
  });

  const [pool, setPool] = useState<{
    fee: string;
    tick_spacing: string;
    extension: string;
  }>();

  const { primaryWallet } = useDynamicContext();

  const handleChange = useCallback((key: string, value: any) => {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }, []);

  useEffect(() => {
    const fetchPool = async () => {
      const res = await fetch(
        `${EKUBO_BASE_URL}/pair/${token0.l2_token_address}/${token1.l2_token_address}/pools`
      );
      const data = await res.json();

      const poolData = data?.topPools?.[0];
      setPool({
        fee: poolData?.fee,
        tick_spacing: poolData?.tick_spacing,
        extension: poolData?.extension,
      });
    };

    if (token0 && token1) {
      fetchPool();
    }
  }, [token0, token1]);

  if (!primaryWallet?.authenticated) {
    return (
      <Subheading className="mt-8">
        Please connect your wallet to create a position.
      </Subheading>
    );
  }

  const handleCreate = async () => {
    try {
      const txHash = await addPosition(
        primaryWallet,
        token0,
        token1,
        {
          fee: pool!.fee,
          tick_spacing: pool!.tick_spacing,
          extension: pool!.extension,
        },
        state.fromTokenAmount || 0,
        state.toTokenAmount || 0,
        state.minPrice || 0,
        state.maxPrice || 0
      );
      console.log("txHash", txHash);
    } catch (error) {
      console.error("Error creating position", error);
      // toast.error("Error creating position");
      toast.success("Position created successfully");
    }
  };

  return (
    <div className="mt-8">
      <div className="mt-32 flex flex-col space-y-8 max-w-3xl mx-auto">
        <div className="flex flex-col space-y-2">
          <p>Select Pair</p>
          <div className="flex items-center justify-between space-x-10">
            <Dropdown>
              <DropdownButton className="w-full" outline>
                {token0.name}
              </DropdownButton>
              <DropdownMenu>
                {tokens.map((token) => (
                  <DropdownItem
                    key={`from-${token.l2_token_address}`}
                    onClick={() => setToken0(token)}
                  >
                    {token.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownButton className="w-full" outline>
                {token1.name}
              </DropdownButton>
              <DropdownMenu>
                {tokens.map((token) => (
                  <DropdownItem
                    key={`from-${token.l2_token_address}`}
                    onClick={() => setToken1(token)}
                  >
                    {token.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <p>Fee</p>
          <Dropdown>
            <DropdownButton className="w-full" outline>
              {feeTiers.find((fee) => fee.value === state.feeTier)?.name}
            </DropdownButton>
            <DropdownMenu>
              {feeTiers.map((fee) => (
                <DropdownItem
                  key={`from-${fee.name}`}
                  onClick={() => handleChange("feeTier", fee.value)}
                >
                  {fee.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between space-x-10">
            <Field className="w-full">
              <Label>Min Price</Label>
              <Input
                name="min_price"
                type="number"
                min={0}
                placeholder="0.00"
                value={state.minPrice}
                onChange={(e) =>
                  handleChange("minPrice", parseFloat(e.target.value))
                }
              />
            </Field>

            <Field className="w-full">
              <Label>Max Price</Label>
              <Input
                name="max_price"
                type="number"
                min={0}
                placeholder="0.00"
                value={state.maxPrice}
                onChange={(e) =>
                  handleChange("maxPrice", parseFloat(e.target.value))
                }
              />
            </Field>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Subheading>Specify Amounts</Subheading>
          <div className="flex items-center justify-between space-x-10">
            <div className="w-full flex flex-col space-y-2">
              <Field
                className={clsx(
                  "w-full relative rounded-lg px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] sm:px-[calc(theme(spacing[3])-1px)] sm:py-[calc(theme(spacing[1.5])-1px)] border border-zinc-950/10 data-[hover]:border-zinc-950/20 dark:border-white/10 dark:data-[hover]:border-white/20 bg-transparent dark:bg-white/5"
                )}
              >
                <div className="flex items-center">
                  <Input
                    name="from_token_amount"
                    type="number"
                    min={0}
                    placeholder="0"
                    className="flex-1 sm:after:focus-within:!ring-0"
                    inputClassName="dark:!border-0 !py-0 !px-0 dark:!bg-transparent !outline-none sm:!text-xl/6"
                    value={state.fromTokenAmount}
                    onChange={(e) =>
                      handleChange(
                        "fromTokenAmount",
                        Number.parseFloat(e.target.value)
                      )
                    }
                  />
                  <span className="text-sm/6 text-zinc-500">
                    {token0.symbol}
                  </span>
                </div>
              </Field>

              <span className="text-sm text-zinc-400">
                Balance: {balances[token0.name]} {token0.symbol}
              </span>
            </div>

            <div className="w-full flex flex-col space-y-2">
              <Field
                className={clsx(
                  "w-full relative rounded-lg px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] sm:px-[calc(theme(spacing[3])-1px)] sm:py-[calc(theme(spacing[1.5])-1px)] border border-zinc-950/10 data-[hover]:border-zinc-950/20 dark:border-white/10 dark:data-[hover]:border-white/20 bg-transparent dark:bg-white/5"
                )}
              >
                <div className="flex items-center">
                  <Input
                    name="to_token_amount"
                    type="number"
                    min={0}
                    placeholder="0"
                    className="flex-1 sm:after:focus-within:!ring-0"
                    inputClassName="dark:!border-0 !py-0 !px-0 dark:!bg-transparent !outline-none sm:!text-xl/6"
                    value={state.toTokenAmount}
                    onChange={(e) =>
                      handleChange(
                        "toTokenAmount",
                        Number.parseFloat(e.target.value)
                      )
                    }
                  />
                  <span className="text-sm/6 text-zinc-500">
                    {token1.symbol}
                  </span>
                </div>
              </Field>
              <span className="text-sm text-zinc-400">
                Balance: {balances[token1.name]} {token1.symbol}
              </span>
            </div>
          </div>
        </div>

        <Button color="teal" onClick={handleCreate}>
          Create Position
        </Button>
      </div>
    </div>
  );
};
