import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/state/auth";

/** Shown to signed-in users whose email isn't verified yet. Renders nothing otherwise. */
export function VerifyEmailBanner() {
  const theme = useTheme();
  const { user } = useAuth();

  if (!user || user.emailVerifiedAt) return null;

  return (
    <View style={[styles.banner, { backgroundColor: theme.card }]}>
      <View style={[styles.icon, { backgroundColor: theme.brandPale }]}>
        <Image
          source={require("@/assets/images/profile/Messages.png")}
          style={styles.iconImage}
          contentFit="contain"
          tintColor={theme.brand}
        />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: theme.text }]}>
          Verify your email
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Confirm your email to keep your account secure.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Verify your email"
        onPress={() =>
          router.push({
            pathname: "/verifyEmail",
            params: { email: user.email, from: "reminder" },
          })
        }
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.brand },
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.buttonText, { color: theme.onBrand }]}>
          Verify
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 20,
    marginTop: Spacing.three,
    borderRadius: 20,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconImage: {
    width: 18,
    height: 18,
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    height: 36,
    paddingHorizontal: Spacing.three,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
});
