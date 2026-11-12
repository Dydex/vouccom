import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput } from "@/components/text";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const OTP_LENGTH = 4;

export default function PasswordReset() {
  const router = useRouter();
  const theme = useTheme();
  const { phone } = useLocalSearchParams<{ phone?: string }>();

  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(false);

  const lastDigits = phone ? phone.slice(-2) : "";
  const complete = code.length === OTP_LENGTH;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.greyButton }]}
        >
          <Image
            source={require("@/assets/images/common/backarrow.png")}
            style={styles.backArrow}
            contentFit="contain"
            tintColor={theme.text}
          />
        </Pressable>

        <Text style={[styles.title, { color: theme.accountLoginText }]}>
          Enter the OTP
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {lastDigits
            ? `We've sent a one time password to your\nnumber ending in ${lastDigits}`
            : "We've sent a one time password to your\nphone number"}
        </Text>

        {/* One hidden input holds the code; the circles just display it. */}
        <View style={styles.otpRow}>
          {Array.from({ length: OTP_LENGTH }, (_, i) => {
            const isActive = focused && i === Math.min(code.length, OTP_LENGTH - 1);
            return (
              <View
                key={i}
                style={[
                  styles.circle,
                  {
                    backgroundColor: theme.greyButton,
                    borderColor: isActive ? theme.brand : "transparent",
                  },
                ]}
              >
                <Text style={[styles.digit, { color: theme.text }]}>
                  {code[i] ?? ""}
                </Text>
              </View>
            );
          })}

          <TextInput
            value={code}
            onChangeText={(text) =>
              setCode(text.replace(/\D/g, "").slice(0, OTP_LENGTH))
            }
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={OTP_LENGTH}
            autoFocus
            caretHidden
            accessibilityLabel="One time password"
            style={styles.hiddenInput}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !complete }}
          disabled={!complete}
          // TODO: verify the code with the backend before navigating
          onPress={() => router.push("/changePassword")}
          style={({ pressed }) => [
            styles.confirm,
            { backgroundColor: theme.brand },
            (!complete || pressed) && styles.dimmed,
          ]}
        >
          <Text style={[styles.confirmText, { color: theme.onBrand }]}>
            Confirm
          </Text>
        </Pressable>

        <View style={styles.resendRow}>
          <Text style={[styles.small, { color: theme.textSecondary }]}>
            didn't receive any code?
          </Text>
          <Pressable
            accessibilityRole="button"
            // TODO: request a new code
            onPress={() => {}}
          >
            <Text style={[styles.small, styles.bold, { color: theme.text }]}>
              Resend Code
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four - Spacing.one,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    width: 18,
    height: 14, 
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "500",
    textAlign: "center",
    marginTop: Spacing.four,
  },
  subtitle: {
    marginTop: Spacing.two,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  otpRow: {
    marginTop: Spacing.five,
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.four,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  digit: {
    fontSize: 18,
    fontWeight: "600",
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
  confirm: {
    marginTop: Spacing.four,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "600",
  },
  dimmed: {
    opacity: 0.5,
  },
  resendRow: {
    marginTop: Spacing.three,
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.one,
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
  },
  bold: {
    fontWeight: "600",
  },
});
