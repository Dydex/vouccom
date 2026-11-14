import type { ApiComment } from "@/lib/api";

export type Comment = {
  id: string;
  author: string;
  text: string;
  /** e.g. "11:06AM" */
  time: string;
  /** e.g. "25 July 2026" */
  date: string;
};

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

/** Time and date stamps in the phone's time zone. */
export function stampFor(date: Date): Pick<Comment, "time" | "date"> {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return {
    time: `${hours % 12 || 12}:${minutes}${hours < 12 ? "AM" : "PM"}`,
    date: `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
  };
}

export function toComment(api: ApiComment): Comment {
  return {
    id: api.id,
    author: api.author,
    text: api.body,
    ...stampFor(new Date(api.createdAt)),
  };
}
