export type Comment = {
  id: string;
  author: string;
  text: string;
  /** e.g. "11:06AM" */
  time: string;
  /** e.g. "25 July 2026" */
  date: string;
};

// TODO: replace with the listing's comments from the backend.
export const SAMPLE_COMMENTS: Comment[] = [
  {
    id: "c1",
    author: "David O.",
    text: "I've been following this listing since it went live. Everything looks well presented, and I appreciate that the draw process is transparent. Looking forward to participating.",
    time: "11:06AM",
    date: "25 July 2026",
  },
  {
    id: "c2",
    author: "Amaka N.",
    text: "The inspection documents are very detailed. Great to see the full history before buying vouchers.",
    time: "9:41AM",
    date: "24 July 2026",
  },
  {
    id: "c3",
    author: "Tunde A.",
    text: "Does the winner collect the car in Lagos or is delivery included?",
    time: "6:15PM",
    date: "22 July 2026",
  },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Time and date stamps for a comment posted right now. */
export function stampNow(now = new Date()): Pick<Comment, "time" | "date"> {
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const time = `${hours % 12 || 12}:${minutes}${hours < 12 ? "AM" : "PM"}`;
  const date = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  return { time, date };
}
