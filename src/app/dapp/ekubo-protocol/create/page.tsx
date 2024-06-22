import { Avatar } from "@/components/catalyst/avatar";
import { Heading } from "@/components/catalyst/heading";
import protocols from "@/data/protocols.json";
import { redirect } from "next/navigation";
import { EKUBO_BASE_URL } from "@/constants/ekubo";

export default async function CreatePosition() {
  const slug = "ekubo-protocol";
  const protocol = protocols.find((protocol) => protocol.slug === slug);
  if (!protocol) redirect("/404");

  const response = await fetch(`${EKUBO_BASE_URL}/tokens`);
  const data = await response.json();

  return (
    <>
      <div className="flex justify-between items-center">
        <Heading>
          <Avatar src={protocol.logo} className="size-8 mr-2" />
          {protocol.title}
        </Heading>
      </div>

      <CreatePosition tokens={data} />
    </>
  );
}
