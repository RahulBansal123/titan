import { useEffect, useState, useCallback, useMemo } from "react";
import { EKUBO_BASE_URL } from "@/constants/ekubo";
import type { IPosition, IToken } from "@/types";

export const useFetchPosition = (id: string, tokens: IToken[]) => {
  const [position, setPosition] = useState<IPosition>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const memoizedTokens = useMemo(() => tokens, [tokens]);

  const fetchPosition = useCallback(async () => {
    try {
      const res = await fetch(`${EKUBO_BASE_URL}/${id}`);
      const { name, image, attributes } = (await res.json()) as {
        name: string;
        image: string;
        attributes: { trait_type: string; value: string }[];
      };

      console.log("name", name);
      console.log("image", image);
      console.log("attributes", attributes);

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

      console.log("token0Address", token0Address);
      console.log("token1Address", token1Address);

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

      console.log("position", {
        minPrice,
        maxPrice,
        price,
        token0,
        token1,
        isInRange,
        metadata: {
          id,
          name,
          image,
          attributes,
        },
      });

      const position = {
        minPrice,
        maxPrice,
        price,
        token0,
        token1,
        isInRange,
        metadata: {
          id,
          name,
          image,
          attributes,
        },
      };
      setPosition(position);
    } catch (error) {
      console.error(`Failed to fetch position for id:`, id, error);
      return null;
    }
  }, [memoizedTokens]);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!isCancelled) {
          await fetchPosition();
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
  }, [id, fetchPosition]);

  return { position, isLoading };
};
