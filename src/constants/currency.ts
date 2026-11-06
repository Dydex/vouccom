/** Currency symbol shown before amounts. The design uses a plain "N". */
export const CURRENCY_SYMBOL = "N";

/** 125000 -> "N125,000" */
export function formatNaira(amount: number): string {
  const withCommas = String(Math.round(amount)).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ",",
  );
  return `${CURRENCY_SYMBOL}${withCommas}`;
}
