import { Stack } from "expo-router";

// One stack per tab: sub-screens open on top of the tab's main screen, and the
// tab bar stays visible with this tab highlighted.
export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
