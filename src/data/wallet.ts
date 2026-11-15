/** "Card" for brands without a logo, such as Verve. */
export type CardBrand = "VISA" | "Mastercard" | "Card";

export type SavedCard = {
  id: string;
  brand: CardBrand;
  /** e.g. "VISA" or "Verve" */
  label: string;
  last4: string;
  /** e.g. "08/28" */
  expires: string;
  /** Name on the card. */
  name?: string;
  /** Issuing bank, from Paystack. */
  bank?: string;
  isDefault?: boolean;
};

export type TransactionStatus = "successful" | "pending" | "failed";

export type Transaction = {
  id: string;
  title: string;
  /** e.g. "Today 03:04pm" */
  time: string;
  /** Naira. Positive money in, negative money out. */
  amount: number;
  // Shown in the details pop-up.
  status: TransactionStatus;
  /** e.g. "Wallet Deposit" */
  type: string;
  /** e.g. "Wallet" */
  method: string;
  /** e.g. "TXN-10294" */
  reference: string;
  /** e.g. "01 Sep 2026, 10:42 AM" */
  dateTime: string;
};
