import { EKUBO_NFT_CONTRACT_ADDRESS } from "@/constants/ekubo";
import type { Wallet } from "@dynamic-labs/sdk-react-core";
import type { StarknetWalletConnectorType } from "@dynamic-labs/starknet";
import { Contract } from "starknet";

export async function importPosition(
  wallet: Wallet,
  tsa: string,
  tokenId: number
) {
  if (!wallet) throw new Error("No wallet provided");
  const starknetConnector = wallet.connector as StarknetWalletConnectorType;

  const provider = await starknetConnector.getPublicClient();
  if (!provider) throw new Error("No provider found");

  const signer = await starknetConnector.getSigner();
  if (!signer) throw new Error("No signer found");

  const contractClass = await provider.getClassAt(EKUBO_NFT_CONTRACT_ADDRESS);
  if (!contractClass) throw new Error("Position class not found");

  const contract = new Contract(
    contractClass.abi,
    EKUBO_NFT_CONTRACT_ADDRESS,
    signer
  );

  const { transaction_hash } = await contract.transferFrom(
    wallet.address,
    tsa,
    tokenId
  );

  return transaction_hash;
}
