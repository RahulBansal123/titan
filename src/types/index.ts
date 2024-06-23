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
