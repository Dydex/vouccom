import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import {
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { FONT_FILES } from "@/components/text";
import { ToastProvider } from "@/components/toast";
import { AuthProvider, useAuth } from "@/state/auth";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    [FONT_FILES.light]: SpaceGrotesk_300Light,
    [FONT_FILES.regular]: SpaceGrotesk_400Regular,
    [FONT_FILES.medium]: SpaceGrotesk_500Medium,
    [FONT_FILES.semibold]: SpaceGrotesk_600SemiBold,
    [FONT_FILES.bold]: SpaceGrotesk_700Bold,
  });

  // The splash screen stays up until the fonts are ready (or have failed, in
  // which case the system font is used instead of blocking the app).
  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* Light icons on dark screens, dark icons on light ones. Screens with a
          coloured band set their own. */}
      <StatusBar style="auto" />
      <AuthProvider>
        <ToastProvider>
          <RootNavigator />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { status } = useAuth();

  // Keep the splash screen up while we check for a saved session.
  if (status === "restoring") return null;

  return (
    <>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        {/* Only for signed-in users. Signing out (or an expired session) sends
            anyone on these screens to the login screen. */}
        <Stack.Protected guard={status === "signedIn"} redirectTo="/login">
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="listing/[id]" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
