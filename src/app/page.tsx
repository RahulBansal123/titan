import { Avatar } from "@/components/catalyst/avatar";
import { Badge } from "@/components/catalyst/badge";
import { Button } from "@/components/catalyst/button";
import { Divider } from "@/components/catalyst/divider";
import { Heading, Subheading } from "@/components/catalyst/heading";
import { Link } from "@/components/catalyst/link";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/catalyst/table";
import { ArrowUpRightIcon } from "@heroicons/react/20/solid";
import slugify from "slugify";

export function Stat({
	title,
	value,
	change,
	active,
}: { title: string; value: string; change?: string; active?: string }) {
	return (
		<div>
			<Divider />
			<div className="mt-6 text-lg/6 font-medium sm:text-sm/6">{title}</div>
			<div className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{value}</div>
			{change && (
				<div className="mt-3 text-sm/6 sm:text-xs/6">
					<Badge color={change.startsWith("+") ? "lime" : "pink"}>
						{change}
					</Badge>{" "}
					<span className="text-zinc-500">from last week</span>
				</div>
			)}
			{active && (
				<div className="mt-3 text-sm/6 sm:text-xs/6 flex items-center space-x-4">
					<div>
						<span className="text-zinc-500 mr-2">Active:</span>
						<Badge color="lime">{active}</Badge>
					</div>

					<div>
						<span className="text-zinc-500 mr-2">Out of Range:</span>
						<Badge color="pink">{Number(value) - Number(active)}</Badge>
					</div>
				</div>
			)}
		</div>
	);
}

function PositionCard({
	protocol,
	value,
	token,
	tokenLogo,
	tags,
}: {
	protocol: string;
	value: string;
	token: string;
	tokenLogo: string[];
	tags: string[];
}) {
	return (
		<div>
			<Divider />
			<div className="mt-6 flex items-center justify-between">
				<div className="flex items-center justify-start -space-x-2">
					{tokenLogo.map((logo, index) => (
						<Avatar
							key={index}
							src={logo}
							className="size-6 ring-2 ring-white dark:ring-zinc-900"
						/>
					))}
				</div>
				<div className="text-lg/6 font-medium sm:text-sm/6 text-zinc-300">
					{protocol}
				</div>
			</div>
			<div className="mt-4 text-lg/6 font-medium sm:text-sm/6 space-x-2">
				{tags.map((tag) => (
					<Badge key={tag} color={Math.random() > 0.5 ? "lime" : "pink"}>
						{tag}
					</Badge>
				))}
			</div>
			<div className="my-8 flex items-baseline gap-x-2">
				<h5 className="text-5xl/5 font-semibold sm:text-4xl/5">{value}</h5>
				<h6 className="text-lg/8 font-semibold sm:text-base/8 text-zinc-300">
					{token}
				</h6>
			</div>

			<Link href={`/dapp/${slugify(protocol, { lower: true })}`}>
				<Button className="w-full !cursor-pointer" outline>
					Manage <ArrowUpRightIcon className="w-4 h-4 ml-2" />
				</Button>
			</Link>
		</div>
	);
}

export default function Home() {
	const assets = [
		{
			token: "ETH",
			price: "$2,000",
			amount: "10",
			value: "$20,000",
			logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
		},
		{
			token: "BTC",
			price: "$50,000",
			amount: "1",
			value: "$50,000",
			logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
		},
		{
			token: "USDC",
			price: "$1",
			amount: "1,000",
			value: "$1,000",
			logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
		},
		{
			token: "DAI",
			price: "$1",
			amount: "1,000",
			value: "$1,000",
			logo: "https://cryptologos.cc/logos/dai-dai-logo.png",
		},
	];

	return (
		<>
			<div className="flex justify-between items-center">
				<Heading>Hola Amigo!</Heading>
				<div className="flex gap-2 items-center">
					<Button>Withdraw</Button>
					<Button color="teal">Deposit</Button>
				</div>
			</div>

			<div className="mt-8 flex items-end justify-between">
				<Subheading>Overview</Subheading>
			</div>
			<div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
				<Stat title="Net Worth" value="$2.6M" change="+4.5%" />
				<Stat title="Total Positions" value="5" active="2" />
				<Stat title="Supplied Liquidity" value="5,888" change="-1.5%" />
				<Stat title="Borrowed Liquidity" value="823,067" change="+40.5%" />
			</div>

			<Subheading className="mt-14">Assets</Subheading>

			<Table className="mt-4 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
				<TableHead>
					<TableRow>
						<TableHeader>Token</TableHeader>
						<TableHeader>Price</TableHeader>
						<TableHeader>Amount</TableHeader>
						<TableHeader className="text-right">Value (in USD)</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{assets.map((asset) => (
						<TableRow key={asset.token} title={`Asset ${asset.token}`}>
							<TableCell>
								<div className="flex items-center gap-2">
									<Avatar src={asset.logo} className="size-6" />
									<span>{asset.token}</span>
								</div>
							</TableCell>

							<TableCell>{asset.price}</TableCell>
							<TableCell>{asset.amount}</TableCell>
							<TableCell className="text-right">{asset.value}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<Subheading className="mt-14">Positions</Subheading>

			<div className="mt-4 grid gap-8 xl:gap-10 sm:grid-cols-2 xl:grid-cols-3">
				<PositionCard
					protocol="Nostra Finance"
					value="100"
					token="STRK/ETH"
					tokenLogo={["/networks/starknet.png", "/networks/starknet.png"]}
					tags={["Active"]}
				/>

				<PositionCard
					protocol="Nostra Finance"
					value="100"
					token="STRK/ETH"
					tokenLogo={["/networks/starknet.png"]}
					tags={["Out of range", "Liquidation"]}
				/>
			</div>
		</>
	);
}
