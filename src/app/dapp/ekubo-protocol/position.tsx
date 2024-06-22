import { Avatar } from "@/components/catalyst/avatar";
import { IPosition } from "./page";
import {
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import { formatNumber } from "@/utils/format";
import { Link } from "@/components/catalyst/link";
import React, { useMemo } from "react";
import { Badge } from "@/components/catalyst/badge";

export const Position = React.memo(
  ({
    position: {
      token0,
      token1,
      minPrice,
      maxPrice,
      price,
      isInRange,
      metadata: { name, attributes },
    },
  }: {
    position: IPosition;
  }) => {
    const fees = name.split(" : ")[2];

    const createdValue = attributes.find(
      (attribute) => attribute.trait_type === "minted_timestamp"
    )?.value;
    const createdAt = useMemo(
      () => new Date(Number(createdValue)).toDateString(),
      [createdValue]
    );
    const hash = attributes.find(
      (attribute) => attribute.trait_type === "minted_tx_hash"
    )?.value;
    const link = `https://voyager.online/tx/${hash}`;

    return (
      <div className="flex items-center justify-between text-zinc-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center -space-x-2">
            <Avatar
              src={token0?.logo_url}
              className="size-8 ring-2 ring-white dark:ring-zinc-900"
            />
            <Avatar
              src={token1?.logo_url}
              className="size-8 ring-2 ring-white dark:ring-zinc-900"
            />
          </div>
          <div>
            <h4 className="text-base flex items-center text-zinc-100">
              {token0?.symbol} - {token1?.symbol}
              <span className="ml-4 text-zinc-500 text-sm">{fees}</span>
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

            <div className="mt-1 flex items-center text-zinc-500 text-sm">
              <span>Min:</span>{" "}
              <span className="ml-1">{formatNumber(minPrice)}</span>{" "}
              <ChevronLeftIcon className="size-5" />{" "}
              <ChevronRightIcon className="-ml-3 size-5" /> <span>Max:</span>{" "}
              <span className="ml-1">{formatNumber(maxPrice)}</span>{" "}
              <span className="ml-2">
                {token1?.symbol} per {token0?.symbol}
              </span>
            </div>
          </div>
        </div>

        <div className="text-sm">
          Current Price:{" "}
          <span className="ml-1">
            {formatNumber(price)} {token1?.symbol} per {token0?.symbol}
          </span>
        </div>

        <div className="text-sm">
          Created On: <span className="ml-1">{createdAt}</span>
        </div>
      </div>
    );
  }
);

export const NoPositionFound = () => (
  <div className="border border-dotted rounded-lg p-8 border-zinc-600 text-center text-2xl/8 text-zinc-300">
    <h5>No positions found</h5>
    <h6 className="mt-2 text-base text-zinc-500">
      Create a new position or import an existing one.
    </h6>
  </div>
);
