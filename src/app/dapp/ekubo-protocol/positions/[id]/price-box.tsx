import { Field } from "@/components/catalyst/fieldset";
import { Input } from "@/components/catalyst/input";
import clsx from "clsx";

export const PriceBox = ({
  title,
  price,
  endLabel,
}: {
  title?: string;
  price: number;
  endLabel?: string;
}) => (
  <div className="flex items-center text-zinc-500 text-sm">
    <Field
      className={clsx(
        "w-fit relative rounded-lg px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] sm:px-[calc(theme(spacing[3])-1px)] sm:py-[calc(theme(spacing[1.5])-1px)] border border-zinc-950/10 data-[hover]:border-zinc-950/20 dark:border-white/10 dark:data-[hover]:border-white/20 bg-transparent dark:bg-white/5"
      )}
    >
      {title && <span className="text-sm/6 text-zinc-500">{title}</span>}
      <div className="flex items-center">
        <Input
          disabled
          type="number"
          className="flex-1 sm:after:focus-within:!ring-0"
          inputClassName="dark:!border-0 !py-0 !px-0 dark:!bg-transparent !outline-none sm:!text-xl/6"
          value={price}
        />
        {endLabel && (
          <span className="text-sm/6 text-zinc-500">{endLabel}</span>
        )}
      </div>
    </Field>
  </div>
);
