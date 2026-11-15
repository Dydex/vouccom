/** Currency symbol shown before amounts. The design uses a plain "N". */
export const CURRENCY_SYMBOL = "N";

/** 125000 -> "N125,000"; 125.5 -> "N125.50" (kobo only when there are some). */
export function formatNaira(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const [whole, kobo] = Math.abs(amount).toFixed(2).split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}${CURRENCY_SYMBOL}${withCommas}${kobo === "00" ? "" : `.${kobo}`}`;
}
