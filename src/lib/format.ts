/** "supremeajala@gmail.com" -> "su••••••••••@gmail.com" */
export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(name.length - 2, 1))}@${domain}`;
}

/** [101, 102, 103] -> "#101 - #103"; [4, 9] -> "#4, #9"; long lists end in "+N more". */
export function formatTickets(numbers: number[], shown = 3): string {
  const sorted = [...numbers].sort((a, b) => a - b);
  if (sorted.length === 0) return "";
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (sorted.length > 1 && last - first === sorted.length - 1) {
    return `#${first} - #${last}`;
  }
  const listed = sorted
    .slice(0, shown)
    .map((n) => `#${n}`)
    .join(", ");
  const rest = sorted.length - shown;
  return rest > 0 ? `${listed} +${rest} more` : listed;
}

const SHORT_MONTHS = [
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

/** "Just now", "30 mins ago", "9:05am", "yesterday", "3 days ago" or "1 Sep". */
export function timeAgo(date: Date, now = new Date()): string {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return minutes === 1 ? "1 min ago" : `${minutes} mins ago`;

  const days = Math.round(
    (new Date(now).setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) /
      86_400_000,
  );
  if (days <= 0) {
    const hours = date.getHours();
    const mins = String(date.getMinutes()).padStart(2, "0");
    return `${hours % 12 || 12}:${mins}${hours < 12 ? "am" : "pm"}`;
  }
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
}

/** "8031234567" -> "•••••• 4567" */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 4 ? `•••••• ${digits.slice(-4)}` : phone;
}
