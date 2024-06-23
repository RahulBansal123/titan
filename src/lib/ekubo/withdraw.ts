import { EKUBO_POSITIONS_CONTRACT_ADDRESS } from "@/constants/ekubo";
import type { IPosition } from "@/types";
import type { Wallet } from "@dynamic-labs/sdk-react-core";
import type { StarknetWalletConnectorType } from "@dynamic-labs/starknet";
import { type AccountInterface, Call, CallData, Contract, num } from "starknet";

export const withdrawPosition = async (
  wallet: Wallet,
  pos: IPosition,
  liquidity: BigInt
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

  const fees = pos.metadata.attributes.find((attr) => attr.trait_type === "fee")
    ?.value as string;
  const tick_spacing = pos.metadata.attributes.find(
    (attr) => attr.trait_type === "tick_spacing"
  )?.value as string;
  const extension = pos.metadata.attributes.find(
    (attr) => attr.trait_type === "extension"
  )?.value as string;

  const tick_lower = pos.metadata.attributes.find(
    (attr) => attr.trait_type === "tick_lower"
  )?.value as string;
  const tick_upper = pos.metadata.attributes.find(
    (attr) => attr.trait_type === "tick_upper"
  )?.value as string;

  const withdrawCall: Call = {
    contractAddress: EKUBO_POSITIONS_CONTRACT_ADDRESS,
    entrypoint: "withdraw",
    calldata: CallData.compile({
      id: pos.metadata.id,
      pool_key: {
        token0: pos.token0.l2_token_address,
        token1: pos.token1.l2_token_address,
        fee: num.toHex(fees),
        tick_spacing: num.toHex(tick_spacing),
        extension,
      },
      bounds: {
        lower: {
          sign: BigInt(tick_lower) < 0,
          mag: num.toHex(tick_lower),
        },
        upper: {
          sign: BigInt(tick_upper) < 0,
          mag: num.toHex(tick_upper),
        },
      },
      liquidity,
      min_token0: 0,
      min_token1: 0,
      collect_fees: true,
    }),
  };

  const { transaction_hash } = await signer.execute([withdrawCall]);

  console.log("transaction_hash", transaction_hash);

  return transaction_hash;
};
