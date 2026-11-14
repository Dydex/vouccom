import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { QueryClientProvider } from "@tanstack/react-query";
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
import { queryClient } from "@/lib/query-client";
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

  // On font error, render anyway with the system font.
  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <RootNavigator />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { status } = useAuth();

  if (status === "restoring") return null;

  return (
    <>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        {/* Redirects to /login when signed out. */}
        <Stack.Protected guard={status === "signedIn"} redirectTo="/login">
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="listing/[id]" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
