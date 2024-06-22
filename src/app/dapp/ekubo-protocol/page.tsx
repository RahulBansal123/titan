"use client";

import { Stat } from "@/app/page";
import { Avatar } from "@/components/catalyst/avatar";
import { Button } from "@/components/catalyst/button";
import { Heading, Subheading } from "@/components/catalyst/heading";
import { EKUBO_BASE_URL } from "@/constants/ekubo";
import protocols from "@/data/protocols.json";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { NoPositionFound, Position } from "./position";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { formatNumber } from "@/utils/format";

export interface IToken {
  decimals: number;
  l2_token_address: string;
  logo_url: string;
  name: string;
  sort_order: number;
  symbol: string;
  total_supply: number;
}

export interface IPosition {
  minPrice: number;
  maxPrice: number;
  price: number;
  isInRange: boolean;
  token0: IToken;
  token1: IToken;
  metadata: IMetadata;
}

export interface IMetadata {
  name: string;
  description: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
}

export default function Dapp() {
  const slug = "ekubo-protocol";
  const protocol = protocols.find((protocol) => protocol.slug === slug);
  if (!protocol) redirect("/404");

  const { primaryWallet } = useDynamicContext();

  const [tokens, setTokens] = useState<IToken[]>([]);
  const [metadatas, setMetadatas] = useState<IMetadata[]>([]);
  const [positions, setPositions] = useState<IPosition[]>([]);

  useEffect(() => {
    const fetchTokens = async () => {
      const response = await fetch(`${EKUBO_BASE_URL}/tokens`);
      const data = await response.json();
      setTokens(data || []);
    };

    const fetchMetadatas = async () => {
      const response = await fetch(
        `${EKUBO_BASE_URL}/positions/${primaryWallet?.address}`
      );
      const data = await response.json();
      const metadataUrls = data?.data.map(
        (position: { metadata_url: string }) => position.metadata_url
      );

      const metadata = (await Promise.all(
        metadataUrls.map(async (url: string) => {
          const response = await fetch(url);
          return response.json();
        })
      )) as IMetadata[];

      setMetadatas(metadata);
    };

    const fetchData = async () => {
      await Promise.all([fetchTokens(), fetchMetadatas()]);
    };

    if (primaryWallet?.authenticated) fetchData();
  }, [primaryWallet]);

  useEffect(() => {
    const updatePositions = async () => {
      const promises = metadatas.map(async (metadata, index) => {
        const { name, attributes } = metadata;

        const parts = name.split(" : ")[1].split(" <> ");
        const minPrice = Number(parts[0]);
        const maxPrice = Number(parts[1]);

        const token0Address = attributes
          .find((attribute) => attribute.trait_type === "token0")
          ?.value.slice(-60);
        const token1Address = attributes
          .find((attribute) => attribute.trait_type === "token1")
          ?.value.slice(-60);

        if (!token0Address || !token1Address) return null;
        const token0 = tokens.find(
          (token) => token.l2_token_address.slice(-60) === token0Address
        );
        const token1 = tokens.find(
          (token) => token.l2_token_address.slice(-60) === token1Address
        );

        if (!token0 || !token1) return null;

        const response = await fetch(
          `${EKUBO_BASE_URL}/price/${token0.l2_token_address}/${token1.l2_token_address}`
        );
        const data = await response.json();
        const price = Number(data?.price) || 0;
        const isInRange =
          Number(minPrice) <= price && price <= Number(maxPrice);

        return {
          minPrice,
          maxPrice,
          price,
          token0,
          token1,
          isInRange,
          metadata,
        };
      });

      const positions = await Promise.all(promises);
      setPositions(positions.filter((position) => position !== null));
    };

    if (metadatas.length > 0) updatePositions();
  }, [metadatas]);

  const totalActivePositions = positions.filter(
    (position) => position.isInRange
  ).length;

  return (
    <>
      <div className="flex justify-between items-center">
        <Heading>
          <Avatar src={protocol.logo} className="size-8 mr-2" />
          {protocol.title}
        </Heading>

        <div className="flex gap-2 items-center">
          <Button outline className="!border-teal-600 !border-2">
            Import Position
          </Button>
          <Button href={`/dapp/${slug}/create`} color="teal">
            Create Position
          </Button>
        </div>
      </div>

      {primaryWallet?.authenticated ? (
        <div>
          <Subheading className="mt-8">Overview</Subheading>
          <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            <Stat title="Total Assets" value={`$${formatNumber(12879.12)}`} />
            <Stat
              title="Total Positions"
              value={positions.length.toString()}
              active={totalActivePositions.toString()}
            />
          </div>

          <Subheading className="mt-8 xl:mt-14">Your Positions</Subheading>
          <div className="mt-4">
            {positions.length === 0 ? (
              <NoPositionFound />
            ) : (
              <div className="flex flex-col space-y-4">
                {positions.map((position, index) => (
                  <Position key={index} position={position} />
                ))}
              </div>
            )}
          </div>

          {/* <Subheading className="mt-8 xl:mt-14">Recent Activity</Subheading>
          <div className="mt-4">
            <NoPositionFound />
          </div> */}
        </div>
      ) : (
        <Subheading className="mt-8">
          Please connect your wallet to manage your positions
        </Subheading>
      )}
    </>
  );
}
