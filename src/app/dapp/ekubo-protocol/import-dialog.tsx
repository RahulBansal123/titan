"use client";

import { Dialog, DialogBody, DialogTitle } from "@/components/catalyst/dialog";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import clsx from "clsx";
import type { IToken } from "@/types";
import { useFetchAndUpdatePositions } from "@/hooks/useFetchAndUpdatePositions";
import { Avatar } from "@/components/catalyst/avatar";
import { Badge } from "@/components/catalyst/badge";
import { Button } from "@/components/catalyst/button";
import toast from "react-hot-toast";
import { importPosition } from "@/lib/ekubo/import";

interface ImportDialogProps {
	isOpen: boolean;
	tokens: IToken[];
	tsa: string;
	onClose: () => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
	isOpen,
	tokens,
	tsa,
	onClose,
}) => {
	const { primaryWallet } = useDynamicContext();
	const positions = useFetchAndUpdatePositions(primaryWallet?.address, tokens);

	const handleImportPosition = async (tokenId: number) => {
		try {
			if (!primaryWallet) {
				toast.error("Please connect your wallet first");
				return;
			}
			onClose();
			await importPosition(primaryWallet, tsa, tokenId);
			toast.success("Position imported successfully");
		} catch (error) {
			console.error(error);
			toast.error("Failed to import position");
		}
	};

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Import Positions</DialogTitle>
			<DialogBody>
				{positions.map((pos, mId) => (
					<div
						key={`pos-${pos.token0}-${pos.token1}-${mId}`}
						className={clsx(
							"w-full flex items-center relative rounded-lg px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] sm:px-[calc(theme(spacing[3])-1px)] sm:py-[calc(theme(spacing[1.5])-1px)] border border-zinc-950/10 data-[hover]:border-zinc-950/20 dark:border-white/10 dark:data-[hover]:border-white/20 bg-transparent dark:bg-white/5",
						)}
					>
						<div className="flex items-center justify-center -space-x-2">
							<Avatar
								src={pos.token0?.logo_url}
								className="size-8 ring-2 ring-white dark:ring-zinc-900"
							/>
							<Avatar
								src={pos.token1?.logo_url}
								className="size-8 ring-2 ring-white dark:ring-zinc-900"
							/>
						</div>

						<h4 className="text-base flex items-center text-zinc-100">
							{pos.token0?.symbol} - {pos.token1?.symbol}
							<Badge className="ml-3" color={pos.isInRange ? "lime" : "pink"}>
								{pos.isInRange ? "In Range" : "Out of Range"}
							</Badge>
						</h4>

						<Button className="ml-auto" onClick={handleImportPosition}>
							Import
						</Button>
					</div>
				))}
			</DialogBody>
		</Dialog>
	);
};
