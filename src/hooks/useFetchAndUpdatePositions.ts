import { useEffect, useState } from "react";
import { EKUBO_BASE_URL } from "@/constants/ekubo";
import type { IMetadata, IPosition, IToken } from "@/types";

export const useFetchAndUpdatePositions = (
  address: string | null | undefined,
  tokens: IToken[]
) => {
  const [positions, setPositions] = useState<IPosition[]>([]);
  const [metadatas, setMetadatas] = useState<IMetadata[]>([]);

  useEffect(() => {
    const fetchMetadatas = async (address: string) => {
      const response = await fetch(`${EKUBO_BASE_URL}/positions/${address}`);
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

    if (address) fetchMetadatas(address);
  }, [address]);

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
  }, [metadatas, tokens]);

  return positions;
};
