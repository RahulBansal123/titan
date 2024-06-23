import { useEffect, useState, useCallback, useMemo } from "react";
import { EKUBO_BASE_URL } from "@/constants/ekubo";
import type { IMetadata, IPosition, IToken } from "@/types";

export const useFetchAndUpdatePositions = (
  address: string | null | undefined,
  tokens: IToken[]
) => {
  const [positions, setPositions] = useState<IPosition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const memoizedTokens = useMemo(() => tokens, [tokens]);

  const fetchMetadatas = useCallback(async (address: string) => {
    const response = await fetch(`${EKUBO_BASE_URL}/positions/${address}`);
    const data = await response.json();
    const metadataUrls = data?.data.map(
      (position: { metadata_url: string }) => position.metadata_url
    );

    const metadata = await Promise.all(
      metadataUrls.map(async (url: string) => {
        try {
          const id = url.split("/").pop();
          const response = await fetch(url);
          const data = await response.json();
          return { ...data, id };
        } catch (error) {
          console.error(`Failed to fetch metadata from ${url}:`, error);
          return null;
        }
      })
    );

    return metadata.filter((m) => m !== null) as IMetadata[];
  }, []);

  const updatePositions = useCallback(
    async (metadatas: IMetadata[]) => {
      const promises = metadatas.map(async (metadata) => {
        try {
          const { name, attributes } = metadata;
          const [minPrice, maxPrice] = name
            .split(" : ")[1]
            .split(" <> ")
            .map(Number);

          const token0Address = attributes
            .find((attr) => attr.trait_type === "token0")
            ?.value.slice(-60);
          const token1Address = attributes
            .find((attr) => attr.trait_type === "token1")
            ?.value.slice(-60);

          if (!token0Address || !token1Address) return null;

          const token0 = memoizedTokens.find(
            (token) => token.l2_token_address.slice(-60) === token0Address
          );
          const token1 = memoizedTokens.find(
            (token) => token.l2_token_address.slice(-60) === token1Address
          );

          if (!token0 || !token1) return null;

          const response = await fetch(
            `${EKUBO_BASE_URL}/price/${token0.l2_token_address}/${token1.l2_token_address}`
          );
          const data = await response.json();
          const price = Number(data?.price) || 0;
          const isInRange = minPrice <= price && price <= maxPrice;

          return {
            minPrice,
            maxPrice,
            price,
            token0,
            token1,
            isInRange,
            metadata,
          };
        } catch (error) {
          console.error(
            `Failed to update position for metadata:`,
            metadata,
            error
          );
          return null;
        }
      });

      const positions = await Promise.all(promises);
      setPositions(positions.filter((position) => position !== null));
    },
    [memoizedTokens]
  );

  useEffect(() => {
    if (!address) return;

    let isCancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const metadatas = await fetchMetadatas(address);
        if (!isCancelled && metadatas.length > 0) {
          await updatePositions(metadatas);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [address, fetchMetadatas, updatePositions]);

  return { positions, isLoading };
};
