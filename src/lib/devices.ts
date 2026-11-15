// Names a signed-in device from its user agent, e.g. "Chrome on Windows".

export type DeviceKind = "phone" | "computer" | "unknown";

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
  [/Safari\//, "Safari"],
];

export function describeDevice(userAgent: string | null): {
  name: string;
  kind: DeviceKind;
} {
  const ua = userAgent ?? "";
  const browser = BROWSERS.find(([pattern]) => pattern.test(ua))?.[1];
  const on = (system: string) => (browser ? `${browser} on ${system}` : system);

  // The app itself: React Native's requests on iOS and Android.
  if (/iPad/.test(ua)) return { name: on("iPad"), kind: "phone" };
  if (/iPhone|iOS|CFNetwork|Darwin/.test(ua)) {
    return { name: on("iPhone"), kind: "phone" };
  }
  if (/Android|okhttp/i.test(ua)) {
    return { name: on("Android phone"), kind: "phone" };
  }
  if (/Windows/.test(ua)) return { name: on("Windows"), kind: "computer" };
  if (/Macintosh|Mac OS X/.test(ua))
    return { name: on("Mac"), kind: "computer" };
  if (/Linux|CrOS/.test(ua)) return { name: on("Linux"), kind: "computer" };
  return { name: browser ?? "Unknown device", kind: "unknown" };
}
