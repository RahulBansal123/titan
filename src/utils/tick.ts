import { FeeAmount } from "@/constants/ekubo";
import Decimal from "decimal.js-light";

export const convertPriceToTick = (price: number) => {
  const priceSqrtRatioX128 = new Decimal(price)
    .sqrt()
    .mul(new Decimal(2).pow(128))
    .toFixed(0);

  const tick = getTickAtSqrtRatio(BigInt(priceSqrtRatioX128));
  return tick;
};

export const getFeeX128 = (fee: FeeAmount): bigint => {
  return (BigInt(fee) * 2n ** 128n) / 10n ** 6n;
};

function getTickAtSqrtRatio(sqrt_ratio_x128: bigint): number {
  Decimal.set({ precision: 78 });

  const sqrt_ratio = new Decimal(sqrt_ratio_x128.toString()).div(
    new Decimal(2).pow(128)
  );
  const tick = sqrt_ratio
    .div(new Decimal("1.000001").sqrt())
    .log()
    .div(new Decimal("2").log())
    .toFixed(0);
  return Number(tick);
}
