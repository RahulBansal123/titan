"use client";

import { Stat } from "@/app/page";
import { Avatar } from "@/components/catalyst/avatar";
import { Button } from "@/components/catalyst/button";
import { Heading, Subheading } from "@/components/catalyst/heading";
import Spinner from "@/components/spinner";
import { EKUBO_BASE_URL } from "@/constants/ekubo";
import protocols from "@/data/protocols.json";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { NoPositionFound, Position } from "./position";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { formatNumber } from "@/utils/format";
import { createTitanAccount } from "@/lib/account/create";
import toast from "react-hot-toast";
import { fetchUserAction } from "@/lib/actions/user";
import { ImportDialog } from "./import-dialog";
import type { IToken } from "@/types";
import { useFetchAndUpdatePositions } from "@/hooks/useFetchAndUpdatePositions";

export default function Dapp() {
  const slug = "ekubo-protocol";
  const protocol = protocols.find((protocol) => protocol.slug === slug);
  if (!protocol) redirect("/404");

  const { primaryWallet } = useDynamicContext();

  const [user, setUser] = useState<{
    address: string;
    tsa: string | null;
  } | null>(null);
  const [tokens, setTokens] = useState<IToken[]>([]);

  const [isImportDialogOpen, setIsImportDialogOpen] = useState<boolean>(false);

  const { positions, isLoading } = useFetchAndUpdatePositions(
    user?.tsa,
    tokens
  );

  useEffect(() => {
    const fetchTokens = async () => {
      const response = await fetch(`${EKUBO_BASE_URL}/tokens`);
      const data = await response.json();
      setTokens(data || []);
    };

    const fetchUser = async () => {
      const user = await fetchUserAction(primaryWallet!.address as string);
      setUser(user);
    };

    const fetchData = async () => {
      await Promise.all([fetchTokens(), fetchUser()]);
    };

    if (primaryWallet?.authenticated) fetchData();
  }, [primaryWallet]);

  const totalActivePositions = positions.filter(
    (position) => position.isInRange
  ).length;

  const handleTSAAccountCreation = async () => {
    try {
      if (!primaryWallet) {
        toast.error("Please connect your wallet first");
        return;
      }
      await createTitanAccount(primaryWallet);
      toast.success("TSA Account created successfully");
      const user = await fetchUserAction(primaryWallet!.address as string);
      setUser(user);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create TSA Account");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <Heading>
          <Avatar src={protocol.logo} className="size-8 mr-2" />
          {protocol.title}
        </Heading>

        <div className="flex gap-2 items-center">
          <Button
            disabled={!user?.tsa}
            outline
            className="!border-teal-600 !border-2"
            onClick={() => setIsImportDialogOpen(true)}
          >
            Import Position
          </Button>
          <Button
            disabled={!user?.tsa}
            href={`/dapp/${slug}/create`}
            color="teal"
            className="disabled:!opacity-50"
          >
            Create Position
          </Button>
          {!user?.tsa && (
            <Button color="teal" onClick={handleTSAAccountCreation}>
              Create TSA Account
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-10 mx-auto">
          <Spinner />
        </div>
      ) : (
        <>
          {primaryWallet?.authenticated ? (
            <div>
              <Subheading className="mt-8">Overview</Subheading>
              <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
                <Stat
                  title="Total Assets"
                  value={`$${formatNumber(12879.12)}`}
                />
                <Stat
                  title="Total Positions"
                  value={positions.length.toString()}
                  active={totalActivePositions.toString()}
                />
              </div>

              <Subheading className="mt-8 xl:mt-14">Your Positions</Subheading>
              <div className="mt-4">
                {positions.length === 0 ? (
                  <NoPositionFound />
                ) : (
                  <div className="flex flex-col space-y-8">
                    {positions.map((position, index) => (
                      <Position key={index} position={position} />
                    ))}
                  </div>
                )}
              </div>

              {/* <Subheading className="mt-8 xl:mt-14">Recent Activity</Subheading>
          <div className="mt-4">
            <NoPositionFound />
          </div> */}
            </div>
          ) : (
            <Subheading className="mt-8">
              Please connect your wallet to manage your positions
            </Subheading>
          )}
        </>
      )}

      {isImportDialogOpen && (
        <ImportDialog
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          tokens={tokens}
          tsa={user?.tsa}
        />
      )}
    </>
  );
}
