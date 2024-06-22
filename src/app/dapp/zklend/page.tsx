import { Avatar } from "@/components/catalyst/avatar";
import { Heading } from "@/components/catalyst/heading";
import protocols from "@/data/protocols.json";
import { redirect } from "next/navigation";

export default function Dapp({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const protocol = protocols.find((protocol) => protocol.slug === slug);
  if (!protocol) redirect("/404");

  return (
    <div className="flex justify-between items-center">
      <Heading>
        <Avatar src={protocol.logo} className="size-8 mr-2" />
        {protocol.title}
      </Heading>
    </div>
  );
}
