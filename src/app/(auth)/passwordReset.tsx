import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { CodeInput } from "@/components/code-input";
import { Text } from "@/components/text";
import { SafeAreaView } from "react-native-safe-area-context";

import { useToast } from "@/components/toast";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ApiError, forgotPassword } from "@/lib/api";
import { maskEmail } from "@/lib/format";

const OTP_LENGTH = 6;
const RESEND_AFTER_SECONDS = 60;

export default function PasswordReset() {
  const router = useRouter();
  const theme = useTheme();
  const toast = useToast();
  const { email = "" } = useLocalSearchParams<{ email?: string }>();

  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_AFTER_SECONDS);

  const complete = code.length === OTP_LENGTH;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const resend = async () => {
    setSecondsLeft(RESEND_AFTER_SECONDS);
    try {
      await forgotPassword(email);
      toast.show({ tone: "success", message: "We sent you a new code." });
    } catch (error) {
      toast.show({
        tone: "error",
        message:
          error instanceof ApiError ? error.message : "Couldn't send the code.",
      });
    }
  };

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
          {`We've sent a 6-digit code to\n${maskEmail(email)}`}
        </Text>

        <View style={styles.otpRow}>
          <CodeInput
            length={OTP_LENGTH}
            value={code}
            onChangeText={setCode}
            shape="circle"
            accessibilityLabel="One time password"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !complete }}
          disabled={!complete}
          // The API checks the code together with the new password, on the next screen.
          onPress={() =>
            router.push({
              pathname: "/changePassword",
              params: { email, code },
            })
          }
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
          {secondsLeft > 0 ? (
            <Text style={[styles.small, { color: theme.textSecondary }]}>
              Resend in {secondsLeft}s
            </Text>
          ) : (
            <Pressable accessibilityRole="button" onPress={resend} hitSlop={8}>
              <Text style={[styles.small, styles.bold, { color: theme.text }]}>
                Resend Code
              </Text>
            </Pressable>
          )}
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
