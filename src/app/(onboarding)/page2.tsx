import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function OnboardingPageTwo() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.brand }]}>
        <Image
          source={require("@/assets/images/onboarding/Discover 4.png")}
          style={styles.lens}
          contentFit="contain"
        />
      </View>

      <View style={styles.dots}>
        <View style={[styles.dotActive, { backgroundColor: theme.brand }]} />
        <View style={[styles.dot, { backgroundColor: theme.brandPale }]} />
        <View style={[styles.dot, { backgroundColor: theme.brandPale }]} />
      </View>

      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.text }]}>Discover{"\n"}Your Dream Asset</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>
          Explore verified vehicles and find{"\n"}your next opportunity on
          VOUCCOM.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace("/page3")}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.brand },
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.buttonText, { color: theme.onBrand }]}>Next</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.four - Spacing.one,
    paddingTop: Spacing.four + Spacing.one,
  },
  card: {
    alignSelf: "stretch",
    height: 406,
    borderRadius: 28,
  },
  lens: {
    position: "absolute",
    left: -20,
    top: 118,
    width: 331,
    height: 222,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: 40,
  },
  dotActive: {
    width: 54,
    height: 5,
    borderRadius: 3,
  },
  dot: {
    width: 10,
    height: 5,
    borderRadius: 3,
  },
  copy: {
    alignItems: "center",
    gap: Spacing.three,
    marginTop: 40,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "500",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  button: {
    marginTop: 48,
    width: 170,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
