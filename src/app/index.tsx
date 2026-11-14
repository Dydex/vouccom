import { Redirect } from "expo-router";

import { useAuth } from "@/state/auth";

// App entry point: signed-in users go straight to Home, everyone else to onboarding.
export default function Index() {
  const { status } = useAuth();
  return <Redirect href={status === "signedIn" ? "/home" : "/page1"} />;
}
