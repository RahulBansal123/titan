import { Stat } from "@/app/page";
import { Avatar } from "@/components/catalyst/avatar";
import { Button } from "@/components/catalyst/button";
import { Heading, Subheading } from "@/components/catalyst/heading";
import protocols from "@/data/protocols.json";
import { redirect } from "next/navigation";

export default function Dapp({ params }: { params: { slug: string } }) {
	const { slug } = params;
	const protocol = protocols.find((protocol) => protocol.slug === slug);
	if (!protocol) redirect("/404");

	return (
		<>
			<div className="flex justify-between items-center">
				<Heading>
					<Avatar src={protocol.logo} className="size-8 mr-2" />
					{protocol.title}
				</Heading>

				<div className="flex gap-2 items-center">
					<Button outline className="!border-teal-600 !border-2">
						Import Position
					</Button>
					<Button color="teal">Create Position</Button>
				</div>
			</div>

			<Subheading className="mt-8">Overview</Subheading>
			<div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
				<Stat title="Total Assets" value="$2.6M" />
				<Stat title="Total Positions" value="5" active="2" />
			</div>

			<Subheading className="mt-8 xl:mt-14">Your Positions</Subheading>
			<div className="mt-4">
				<NoPositionFound />
			</div>

			<Subheading className="mt-8 xl:mt-14">Recent Activity</Subheading>
			<div className="mt-4">
				<NoPositionFound />
			</div>
		</>
	);
}

const NoPositionFound = () => (
	<div className="border border-dotted rounded-lg p-8 border-zinc-600 text-center text-2xl/8 text-zinc-300">
		<h5>No positions found</h5>
		<h6 className="mt-2 text-base text-zinc-500">
			Create a new position or import an existing one.
		</h6>
	</div>
);
