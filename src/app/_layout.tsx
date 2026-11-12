import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import {
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { FONT_FILES } from '@/components/text';
import { ToastProvider } from '@/components/toast';

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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ToastProvider>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ToastProvider>
    </ThemeProvider>
  );
}
