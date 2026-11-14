/** "supremeajala@gmail.com" -> "su••••••••••@gmail.com" */
export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(name.length - 2, 1))}@${domain}`;
}
