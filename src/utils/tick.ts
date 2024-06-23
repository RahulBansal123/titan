export const convertPriceToTick = (price: number) => {
  const sqrt_ratio = Math.sqrt(price * 2 ** 256);
  const tick = Math.log(sqrt_ratio / 2 ** 128) / Math.log(Math.sqrt(1.000001));
  return Math.round(tick) < 0 ? Math.round(tick) * -1 : Math.round(tick);
};

export const getPoolTickSpacing = (hexTickSpacing: string): number => {
  return Number(Number(Number(BigInt(hexTickSpacing)) / 1000000).toFixed(4));
};
