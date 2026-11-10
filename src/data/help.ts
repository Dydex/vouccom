export type HelpTone = "howTos" | "vouchers" | "draws" | "entries";

export type HelpCategory = {
  id: HelpTone;
  title: string;
  questions: string[];
};

// TODO: replace with the real help articles. The first three questions in each
// group are the placeholders shown in the design; the others are made up.
const COMMON = [
  "How do I fund my wallet?",
  "How do I delete my saved card?",
  "What is Service Fee?",
];

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "howTos",
    title: "How tos",
    questions: [
      ...COMMON,
      "How do I update my profile details?",
      "How do I change my password?",
    ],
  },
  {
    id: "vouchers",
    title: "Vouchers",
    questions: [
      ...COMMON,
      "How many vouchers can I buy?",
      "Can I get a refund on a voucher?",
    ],
  },
  {
    id: "draws",
    title: "Draws",
    questions: [
      ...COMMON,
      "How are winners picked?",
      "Where can I watch a draw?",
    ],
  },
  {
    id: "entries",
    title: "Entries",
    questions: [
      ...COMMON,
      "How do I check my entries?",
      "What happens if I win?",
    ],
  },
];

/** How many questions show before a group is expanded. */
export const COLLAPSED_COUNT = 3;
