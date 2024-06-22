"use client";

import { Subheading } from "@/components/catalyst/heading";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Field, Label } from "@/components/catalyst/fieldset";
import {
  Listbox,
  ListboxLabel,
  ListboxOption,
} from "@/components/catalyst/listbox";
import { IToken } from "../page";
import { useState, useCallback, useMemo } from "react";
import { Input } from "@/components/catalyst/input";
import clsx from "clsx";
import { Button } from "@/components/catalyst/button";

const feeTiers = [
  { name: "0.01% fee and 0.02% precision", value: "0.0001" },
  { name: "0.05% fee and 0.1% precision", value: "0.0005" },
  { name: "0.3% fee and 0.6% precision", value: "0.003" },
  { name: "1% fee and 2% precision", value: "0.01" },
  { name: "5% fee and 10% precision", value: "0.05" },
];

export const CreatePosition = ({ tokens }: { tokens: IToken[] }) => {
  const [state, setState] = useState({
    token0: tokens[0],
    token1: tokens[1],
    feeTier: feeTiers[0].value,
    minPrice: undefined,
    maxPrice: undefined,
    fromTokenAmount: undefined,
    toTokenAmount: undefined,
  });

  const { primaryWallet } = useDynamicContext();

  const handleChange = useCallback((key: string, value: any) => {
    console.log("key", key, "value", value);
    setState((prevState) => ({ ...prevState, [key]: value }));
  }, []);

  const feeOptions = useMemo(
    () =>
      feeTiers.map((fee) => (
        <ListboxOption key={fee.value} value={fee.value}>
          <ListboxLabel>{fee.name}</ListboxLabel>
        </ListboxOption>
      )),
    []
  );

  if (!primaryWallet?.authenticated) {
    return (
      <Subheading className="mt-8">
        Please connect your wallet to create a position.
      </Subheading>
    );
  }

  console.log("state", state);

  return (
    <div className="mt-8">
      <div className="mt-32 flex flex-col space-y-8 max-w-3xl mx-auto">
        <div className="flex flex-col space-y-2">
          <p>Select Pair</p>
          <div className="flex items-center justify-between space-x-10">
            <Field className="w-full">
              <Listbox
                name="from"
                value={state.token0}
                onChange={(e) => handleChange("token0", e)}
              >
                {tokens.map((token) => (
                  <ListboxOption
                    key={`from-${token.l2_token_address}`}
                    value={token}
                  >
                    <ListboxLabel>{token.name}</ListboxLabel>
                  </ListboxOption>
                ))}
              </Listbox>
            </Field>

            <Field className="w-full">
              <Listbox
                name="to"
                value={state.token1}
                onChange={(e) => handleChange("token1", e)}
              >
                {tokens.map((token) => (
                  <ListboxOption
                    key={`to-${token.l2_token_address}`}
                    value={token}
                  >
                    <ListboxLabel>{token.name}</ListboxLabel>
                  </ListboxOption>
                ))}
              </Listbox>
            </Field>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <p>Fee</p>
          <Field className="w-full">
            <Listbox name="fee" defaultValue={state.feeTier}>
              {feeOptions}
            </Listbox>
          </Field>
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
                        parseFloat(e.target.value)
                      )
                    }
                  />
                  <span className="text-sm/6 text-zinc-500">
                    {state.token0.symbol}
                  </span>
                </div>
              </Field>

              <span className="text-sm text-zinc-400">
                Balance: 0.00 {state.token0.symbol}
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
                      handleChange("toTokenAmount", parseFloat(e.target.value))
                    }
                  />
                  <span className="text-sm/6 text-zinc-500">
                    {state.token1.symbol}
                  </span>
                </div>
              </Field>
              <span className="text-sm text-zinc-400">
                Balance: 0.00 {state.token1.symbol}
              </span>
            </div>
          </div>
        </div>

        <Button color="teal">Create Position</Button>
      </div>
    </div>
  );
};
