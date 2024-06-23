import { EKUBO_POSITIONS_CONTRACT_ADDRESS } from "@/constants/ekubo";
import type { IToken } from "@/types";
import type { Wallet } from "@dynamic-labs/sdk-react-core";
import type { StarknetWalletConnectorType } from "@dynamic-labs/starknet";
import {
  type AccountInterface,
  cairo,
  Call,
  CallData,
  Contract,
  num,
} from "starknet";
import { convertPriceToTick } from "@/utils/tick";

export const addPosition = async (
  wallet: Wallet,
  token0: IToken,
  token1: IToken,
  pos: {
    fee: string;
    tick_spacing: string;
    extension: string;
  },
  token0Amount: number,
  token1Amount: number,
  lowerPrice: number,
  upperPrice: number
) => {
  if (!wallet) throw new Error("No wallet provided");
  const starknetConnector = wallet.connector as StarknetWalletConnectorType;

  const provider = await starknetConnector.getPublicClient();
  if (!provider) throw new Error("No provider found");

  const signer = await starknetConnector.getSigner();
  if (!signer) throw new Error("No signer found");

  const contractClass = await provider.getClassAt(
    EKUBO_POSITIONS_CONTRACT_ADDRESS
  );
  if (!contractClass) throw new Error("Position class not found");

  const contract = new Contract(
    contractClass.abi,
    EKUBO_POSITIONS_CONTRACT_ADDRESS,
    signer as AccountInterface
  );

  const tickLower = convertPriceToTick(lowerPrice);
  const tickUpper = convertPriceToTick(upperPrice);

  if (tickLower > tickUpper) {
    throw new Error("Invalid tick range");
  }

  const transferToken0: Call = {
    contractAddress: token0.l2_token_address,
    entrypoint: "transfer",
    calldata: CallData.compile({
      to: EKUBO_POSITIONS_CONTRACT_ADDRESS,
      amount: cairo.uint256(token0Amount * 10 ** token0.decimals),
    }),
  };

  const transferToken1: Call = {
    contractAddress: token1.l2_token_address,
    entrypoint: "transfer",
    calldata: CallData.compile({
      to: EKUBO_POSITIONS_CONTRACT_ADDRESS,
      amount: cairo.uint256(token1Amount * 10 ** token1.decimals),
    }),
  };

  const mintAndDeposit: Call = {
    contractAddress: EKUBO_POSITIONS_CONTRACT_ADDRESS,
    entrypoint: "mint_and_deposit",
    calldata: CallData.compile({
      pool_key: {
        token0: token0.l2_token_address,
        token1: token1.l2_token_address,
        fee: num.toHex(pos.fee),
        tick_spacing: 200,
        extension: 0,
      },
      bounds: {
        lower: {
          mag: num.toHex(tickLower),
          sign: tickLower < 0,
        },
        upper: {
          mag: num.toHex(tickUpper),
          sign: tickUpper < 0,
        },
      },
      min_liquidity: 0,
    }),
  };

  const token0ClearCall: Call = {
    contractAddress: EKUBO_POSITIONS_CONTRACT_ADDRESS,
    entrypoint: "clear",
    calldata: CallData.compile({
      token: token0.l2_token_address,
    }),
  };

  const token1ClearCall: Call = {
    contractAddress: EKUBO_POSITIONS_CONTRACT_ADDRESS,
    entrypoint: "clear",
    calldata: CallData.compile({
      token: token1.l2_token_address,
    }),
  };

  const { transaction_hash } = await signer.execute([
    transferToken0,
    transferToken1,
    mintAndDeposit,
    token0ClearCall,
    token1ClearCall,
  ]);

  console.log("transaction_hash", transaction_hash);

  return transaction_hash;
};
