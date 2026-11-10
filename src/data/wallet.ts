// TODO: read the signed-in user's wallet balance, cards and transactions from the backend.
export const WALLET_BALANCE = 125000;

export type CardBrand = "VISA" | "Mastercard";

export type SavedCard = {
  id: string;
  brand: CardBrand;
  last4: string;
  /** e.g. "08/28" */
  expires: string;
  /** Name on the card. */
  name?: string;
  isDefault?: boolean;
};

export const SAVED_CARDS: SavedCard[] = [
  {
    id: "card-4821",
    brand: "VISA",
    last4: "4821",
    expires: "08/28",
    name: "Kola Lawal",
    isDefault: true,
  },
  {
    id: "card-7891",
    brand: "Mastercard",
    last4: "7891",
    expires: "08/28",
    name: "Kola Lawal",
  },
];

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

export const TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    title: "Wallet top-up",
    time: "Today 03:04pm",
    amount: 50000,
    status: "successful",
    type: "Wallet Deposit",
    method: "Wallet",
    reference: "TXN-10294",
    dateTime: "01 Sep 2026, 10:42 AM",
  },
  {
    id: "t2",
    title: "Voucher purchase",
    time: "Yesterday",
    amount: -2500,
    status: "pending",
    type: "Voucher Purchase",
    method: "Wallet",
    reference: "TXN-10287",
    dateTime: "31 Aug 2026, 04:15 PM",
  },
  {
    id: "t3",
    title: "Voucher purchase",
    time: "2 days ago",
    amount: -30000,
    status: "failed",
    type: "Voucher Purchase",
    method: "Wallet",
    reference: "TXN-10261",
    dateTime: "30 Aug 2026, 09:20 AM",
  },
];
