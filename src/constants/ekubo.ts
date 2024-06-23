export const EKUBO_BASE_URL = "https://sepolia-api.ekubo.org";
// export const EKUBO_BASE_URL="https://mainnet-api.ekubo.org"

export const EKUBO_POSITIONS_CONTRACT_ADDRESS =
  // "0x02e0af29598b407c8716b17f6d2795eca1b471413fa03fb145a5e33722184067";
  "0x06a2aee84bb0ed5dded4384ddd0e40e9c1372b818668375ab8e3ec08807417e5";

export const EKUBO_NFT_CONTRACT_ADDRESS =
  "0x04afc78d6fec3b122fc1f60276f074e557749df1a77a93416451be72c435120f";

export enum FeeAmount {
  LOWEST = 100,
  LOW = 500,
  MEDIUM = 3000,
  HIGH = 10000,
}

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
  [FeeAmount.LOWEST]: 200,
  [FeeAmount.LOW]: 1000,
  [FeeAmount.MEDIUM]: 5096,
  [FeeAmount.HIGH]: 10000,
};
