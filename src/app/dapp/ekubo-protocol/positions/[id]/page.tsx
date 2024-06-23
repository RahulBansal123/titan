"use client";

import React, { useEffect, useMemo, useState } from "react";
import { redirect } from "next/navigation";
import { Heading, Subheading } from "@/components/catalyst/heading";
import { Avatar } from "@/components/catalyst/avatar";
import protocols from "@/data/protocols.json";
import { EKUBO_BASE_URL } from "@/constants/ekubo";
import { useFetchPosition } from "@/hooks/useFetchPosition";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { IPosition, IToken } from "@/types";
import Spinner from "@/components/spinner";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/20/solid";
import { Badge } from "@/components/catalyst/badge";
import { Field } from "@/components/catalyst/fieldset";
import clsx from "clsx";
import { Input } from "@/components/catalyst/input";
import { PriceBox } from "./price-box";
import { Button } from "@/components/catalyst/button";
import { formatDistanceToNow } from "date-fns";

export default function ManagePositionPage({
  params,
}: {
  params: { id: string };
}) {
  const slug = "ekubo-protocol";
  const protocol = protocols.find((protocol) => protocol.slug === slug);
  if (!protocol) redirect("/404");

  const { primaryWallet } = useDynamicContext();
  const [tokens, setTokens] = useState<IToken[]>([]);

  useEffect(() => {
    const fetchTokens = async () => {
      const response = await fetch(`${EKUBO_BASE_URL}/tokens`);
      const data = await response.json();
      setTokens(data || []);
    };

    const fetchData = async () => {
      await fetchTokens();
    };

    if (primaryWallet?.authenticated) fetchData();
  }, [primaryWallet]);

  const { position, isLoading } = useFetchPosition(params.id, tokens);
  if (!position) redirect("/404");

  return (
    <>
      <div className="max-w-6xl">
        <Heading>
          <Avatar src={protocol.logo} className="size-8 mr-2" />
          {protocol.title}
        </Heading>

        {/* {isLoading && (
          <div className="mt-10 mx-auto">
            <Spinner />
          </div>
        )} */}
        {position && <ManagePosition position={position} />}
      </div>
    </>
  );
}

const ManagePosition = ({ position }: { position: IPosition }) => {
  const {
    token0,
    token1,
    minPrice,
    maxPrice,
    price,
    isInRange,
    metadata: { id, name, attributes },
  } = position;

  const fees = name.split(" : ")[2];

  const createdValue = attributes.find(
    (attribute) => attribute.trait_type === "minted_timestamp"
  )?.value;
  const createdAt = useMemo(
    () => `${new Date(Number(createdValue)).toLocaleString()}`,
    [createdValue]
  );
  const hash = attributes.find(
    (attribute) => attribute.trait_type === "minted_tx_hash"
  )?.value;
  const link = `https://voyager.online/tx/${hash}`;

  return (
    <div className="mt-8">
      <div className="flex items-center space-x-4">
        <div className="flex items-center -space-x-2">
          <Avatar
            src={token0?.logo_url}
            className="size-10 ring-2 ring-white dark:ring-zinc-900"
          />
          <Avatar
            src={token1?.logo_url}
            className="size-10 ring-2 ring-white dark:ring-zinc-900"
          />
        </div>

        <h4 className="text-xl flex items-center text-zinc-100">
          {token0?.symbol} - {token1?.symbol}
          <span className="ml-4 text-zinc-500 text-base">{fees}</span>
          <Link
            href={link}
            target="_blank"
            className="cursor-pointer ml-3 text-zinc-500 text-sm"
          >
            <ArrowTopRightOnSquareIcon className="size-4 mb-0.5" />
          </Link>
          <Badge className="ml-3" color={isInRange ? "lime" : "pink"}>
            {isInRange ? "In Range" : "Out of Range"}
          </Badge>
        </h4>
      </div>

      <Subheading className="mt-10">Price Range</Subheading>
      <div className="flex space-x-4">
        <PriceBox
          title="Current Price"
          price={price}
          endLabel={`${token1.symbol}/${token0.symbol}`}
        />
        <PriceBox
          title="Min Price"
          price={minPrice}
          endLabel={`${token1.symbol}/${token0.symbol}`}
        />
        <PriceBox
          title="Max Price"
          price={maxPrice}
          endLabel={`${token1.symbol}/${token0.symbol}`}
        />
      </div>

      <Subheading className="mt-10">Stats</Subheading>
      <div className="flex space-x-4">
        <PriceBox title="Fees" price={1.2} endLabel="USD" />
        <PriceBox title="Fees APR" price={24} />
        <PriceBox title="PnL" price={12} endLabel="USD" />
      </div>

      <Subheading className="mt-10">History</Subheading>
      <div className="flex space-x-4 mt-4 text-zinc-500">
        Position created on: {createdAt}
        <span className="ml-2 text-zinc-400">
          ({formatDistanceToNow(new Date(Number(createdValue)))} ago)
        </span>
      </div>

      <div className="mt-16 flex items-center space-x-4">
        <Button href="/dapp/ekubo-protocol" outline>
          <ArrowLeftIcon className="size-4 mr-2" />
          Back to Positions
        </Button>

        <Button color="teal">Withdraw Position</Button>
      </div>
    </div>
  );
};
