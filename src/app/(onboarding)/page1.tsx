import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";

const BRAND_BLUE = "#2855FF";

export default function OnboardingPageOne() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/Vouccom Illustrations 1.jpg")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="bottom"
      />

      <SafeAreaView style={styles.content}>
        <View style={styles.brandRow}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.brand}>vouccom</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_BLUE,
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
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: 0.5,
  }
});
