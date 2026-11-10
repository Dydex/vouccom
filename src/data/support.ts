export type SupportMessage = {
  id: string;
  subject: string;
  status: "Open" | "Resolved";
  /** e.g. "3 days ago" */
  age: string;
};

// TODO: replace with the support messages about a transaction from the backend.
export const SAMPLE_MESSAGES: SupportMessage[] = [
  {
    id: "m1",
    subject: "Voucher Refund",
    status: "Resolved",
    age: "3 days ago",
  },
  {
    id: "m2",
    subject: "Voucher Refund",
    status: "Resolved",
    age: "3 days ago",
  },
];
