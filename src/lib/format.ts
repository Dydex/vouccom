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
