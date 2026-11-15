// Dates of birth: typed as DD/MM/YYYY, sent as YYYY-MM-DD.

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "1990-01-01..." -> "1 Jan 1990" (read as a calendar date, not a time). */
export function formatCalendarDate(iso: string | null | undefined) {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return undefined;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

const MIN_AGE = 18;

/** "01011990" -> "01/01/1990" as the user types. */
export function formatDob(digits: string) {
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join("/");
}

/** "1990-01-01..." -> "01011990" */
export function digitsFromIso(iso: string | null | undefined) {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}${m[2]}${m[1]}` : "";
}

/** "01011990" -> "1990-01-01", or an error for impossible or under-18 dates. */
export function parseDob(
  digits: string,
  now = new Date(),
): { iso: string } | { error: string } {
  if (digits.length !== 8) return { error: "Enter your date of birth." };
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return { error: "That date doesn't exist." };
  }
  const adult = new Date(year + MIN_AGE, month - 1, day);
  if (adult > now) return { error: `You must be ${MIN_AGE} or over.` };
  return {
    iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
}
