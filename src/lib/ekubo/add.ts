import { EKUBO_POSITIONS_CONTRACT_ADDRESS } from "@/constants/ekubo";
import type { IToken } from "@/types";
import type { Wallet } from "@dynamic-labs/sdk-react-core";
import type { StarknetWalletConnectorType } from "@dynamic-labs/starknet";
import { type AccountInterface, Contract, num } from "starknet";
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
  lowerPrice: string,
  upperPrice: string
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

  const tickLower = convertPriceToTick(Number(lowerPrice));
  const tickUpper = convertPriceToTick(Number(upperPrice));

  console.log("tickLower", tickLower);
  console.log("tickUpper", tickUpper);

  const { transaction_hash } = await contract.mint_and_deposit([
    {
      pool_key: {
        token0: token0.l2_token_address,
        token1: token1.l2_token_address,
        fee: num.toHex(pos.fee),
        tick_spacing: num.toHex(pos.tick_spacing),
        extension: pos.extension,
      },
      bounds: {
        lower: {
          sign: 0,
          mag: num.toHex(tickLower),
        },
        upper: {
          sign: 0,
          mag: num.toHex(tickUpper),
        },
      },
      min_liquidity: 0,
    },
  ]);

  console.log("transaction_hash", transaction_hash);

  return transaction_hash;
};
