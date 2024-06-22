"use client";

import { Wallet } from "@dynamic-labs/sdk-react-core";
import { StarknetWalletConnectorType } from "@dynamic-labs/starknet";
import sierra from "@/data/titan_TitanAccount.contract_class.json";
import casm from "@/data/titan_TitanAccount.compiled_contract_class.json";
import { fetchUserAction, updateUserAction } from "@/actions/user";

export async function createTitanAccount(wallet: Wallet) {
  if (!wallet) throw new Error("No wallet provided");
  const starknetConnector = wallet.connector as StarknetWalletConnectorType;

  const user = await fetchUserAction(wallet.address);
  if (!user) throw new Error("User not found");

  const provider = await starknetConnector.getPublicClient();
  if (!provider) throw new Error("No provider found");

  const signer = await starknetConnector.getSigner();
  if (!signer) throw new Error("No signer found");

  console.log("Deploying TitanAccount contract...");

  const deployResponse = await signer.declareAndDeploy({
    contract: sierra,
    casm: casm,
    constructorCalldata: [wallet.address],
  });

  const contract_address = deployResponse.deploy.contract_address;
  console.log("Contract Class Hash =", deployResponse.declare.class_hash);
  console.log("Contract address =", contract_address);

  await updateUserAction(wallet.address, contract_address);
}
