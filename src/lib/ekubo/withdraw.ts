import { EKUBO_POSITIONS_CONTRACT_ADDRESS } from "@/constants/ekubo";
import type { IPosition } from "@/types";
import type { Wallet } from "@dynamic-labs/sdk-react-core";
import type { StarknetWalletConnectorType } from "@dynamic-labs/starknet";
import { type AccountInterface, Contract } from "starknet";

export const withdrawPosition = async (wallet: Wallet, pos: IPosition) => {
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

  //   25%
  //   [
  //     "0xc9",
  //     "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  //     "0x6f2a0dfeff180133de890ad69c6ba294574c5f34a67890fd22464f348c4d03c",
  //     "0x20c49ba5e353f80000000000000000",
  //     "0x3e8",
  //     "0x0",
  //     "0x7d1f40",
  //     "0x0",
  //     "0x7d9c40",
  //     "0x0",
  //     "0xb744f05e6f5c67",
  //     "0x0",
  //     "0x0",
  //     "0x1"
  //   ]

  //   100%
  //   [
  //     "0x7d1f40",
  //     "0x0",
  //     "0x7d9c40",
  //     "0x0",
  //     "0x2dd13c179bd719d",
  //   ]

  const { transaction_hash } = await contract.withdraw(
    pos.metadata.id,
    pos.token0.l2_token_address,
    pos.token1.l2_token_address,
    pos.metadata.attributes.find((attr) => attr.trait_type === "fee")?.value,
    pos.metadata.attributes.find((attr) => attr.trait_type === "tick_spacing")
      ?.value,
    pos.metadata.attributes.find((attr) => attr.trait_type === "tick_spacing")
      ?.value,
    "",
    false,
    "",
    false,
    "",
    0,
    0,
    true
  );

  return transaction_hash;
};
