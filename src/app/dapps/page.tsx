import { Avatar } from "@/components/catalyst/avatar";
import { Badge } from "@/components/catalyst/badge";
import { Divider } from "@/components/catalyst/divider";
import { Heading } from "@/components/catalyst/heading";
import { Link } from "@/components/catalyst/link";
import protocols from "@/data/protocols.json";

function DApp({
  logo,
  title,
  slug,
  isComingSoon,
}: {
  logo: string;
  title: string;
  slug: string;
  isComingSoon: boolean;
}) {
  return (
    <Link
      aria-disabled={isComingSoon}
      href={isComingSoon ? "/" : `/dapp/${slug}`}
    >
      <Divider />
      <div className="mt-6 flex items-center space-x-6">
        <Avatar src={logo} className="size-14" />
        <div className="text-3xl/8 font-semibold sm:text-2xl/8">{title}</div>
        {isComingSoon && <Badge>Coming Soon</Badge>}
      </div>
    </Link>
  );
}

export default function Dapps() {
  return (
    <>
      <Heading>DApps</Heading>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {protocols.map((protocol) => (
          <DApp key={protocol.slug} {...protocol} />
        ))}
      </div>
    </>
  );
}
