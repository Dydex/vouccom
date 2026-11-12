import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function OnboardingPageOne() {
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => router.replace("/page2"), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.brand }]}>
      <Image
        source={require("@/assets/images/onboarding/Vouccom Illustrations 1.png")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="bottom"
      />

      <SafeAreaView style={styles.content}>
        <View style={styles.brandRow}>
          <Image
            source={require("@/assets/images/onboarding/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={[styles.brand, { color: theme.onBrand }]}>vouccom</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.eight,
    gap: Spacing.four,
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.two,
  },
  logo: {
    width: 39,
    height: 35,
  },
  brand: {
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: 0.5,
  }
});
