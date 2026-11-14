import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text, TextInput } from "@/components/text";
import { useToast } from "@/components/toast";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ApiError, requestEmailCode, verifyEmail } from "@/lib/api";
import { useAuth } from "@/state/auth";

const CODE_LENGTH = 6;
const RESEND_AFTER_SECONDS = 60;

/** "supremeajala@gmail.com" -> "su••••••••••@gmail.com" */
function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(name.length - 2, 1))}@${domain}`;
}

export default function VerifyEmail() {
  const router = useRouter();
  const theme = useTheme();
  const toast = useToast();
  // `from: "signup"` shows the step counter; from the reminder the user is signed in.
  const { email = "", from } = useLocalSearchParams<{
    email?: string;
    from?: "signup" | "reminder";
  }>();
  const { status, refreshUser } = useAuth();

  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_AFTER_SECONDS);

  // Send the first code when the screen opens. The ref stops a second send in
  // React's development double-render.
  const sentInitialCode = useRef(false);
  useEffect(() => {
    if (!email || sentInitialCode.current) return;
    sentInitialCode.current = true;
    requestEmailCode(email).catch((error) => {
      toast.show({
        tone: "error",
        message:
          error instanceof ApiError ? error.message : "Couldn't send the code.",
      });
    });
  }, [email, toast]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const resend = async () => {
    setSecondsLeft(RESEND_AFTER_SECONDS);
    try {
      await requestEmailCode(email);
      toast.show({ tone: "success", message: "We sent you a new code." });
    } catch (error) {
      toast.show({
        tone: "error",
        message:
          error instanceof ApiError ? error.message : "Couldn't send the code.",
      });
    }
  };

  const verify = async () => {
    if (code.length !== CODE_LENGTH) return;
    setVerifying(true);
    try {
      await verifyEmail(email, code);
      if (status === "signedIn") {
        await refreshUser();
        toast.show({ tone: "success", message: "Email verified." });
        router.back();
      } else {
        toast.show({
          tone: "success",
          message: "Email verified. You can sign in now.",
        });
        router.replace({ pathname: "/login", params: { email } });
      }
    } catch (error) {
      setCode("");
      toast.show({
        tone: "error",
        message:
          error instanceof ApiError
            ? error.message
            : "Couldn't verify the code.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const complete = code.length === CODE_LENGTH;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {from === "signup" && (
          <Text style={[styles.step, { color: theme.brand }]}>Step 2 of 2</Text>
        )}
        <Text style={[styles.title, { color: theme.text }]}>
          Verify your email
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          We sent a 6-digit code to{" "}
          <Text style={[styles.email, { color: theme.text }]}>
            {maskEmail(email)}
          </Text>
          .
        </Text>

        <View style={styles.codeRow}>
          {Array.from({ length: CODE_LENGTH }, (_, i) => {
            const active =
              focused && i === Math.min(code.length, CODE_LENGTH - 1);
            return (
              <View
                key={i}
                style={[
                  styles.box,
                  {
                    backgroundColor: theme.greyButton,
                    borderColor: active ? theme.brand : "transparent",
                  },
                ]}
              >
                <Text style={[styles.digit, { color: theme.text }]}>
                  {code[i] ?? ""}
                </Text>
              </View>
            );
          })}

          {/* One invisible input over the boxes: handles typing, paste and code autofill. */}
          <TextInput
            value={code}
            onChangeText={(text) =>
              setCode(text.replace(/\D/g, "").slice(0, CODE_LENGTH))
            }
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            autoFocus
            caretHidden
            accessibilityLabel="Verification code"
            style={styles.hiddenInput}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            disabled: !complete || verifying,
            busy: verifying,
          }}
          disabled={!complete || verifying}
          onPress={verify}
          style={({ pressed }) => [
            styles.verify,
            { backgroundColor: theme.brand },
            (!complete || verifying) && styles.dimmed,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.verifyText, { color: theme.onBrand }]}>
            {verifying ? "Verifying..." : "Verify"}
          </Text>
        </Pressable>

        {secondsLeft > 0 ? (
          <Text style={[styles.link, { color: theme.textSecondary }]}>
            Resend code in {secondsLeft}s
          </Text>
        ) : (
          <Pressable accessibilityRole="button" onPress={resend} hitSlop={8}>
            <Text
              style={[styles.link, styles.linkActive, { color: theme.text }]}
            >
              Resend code
            </Text>
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Text style={[styles.link, { color: theme.textSecondary }]}>
            Wrong email? Go back
          </Text>
        </Pressable>
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
    paddingTop: Spacing.six + Spacing.five,
    paddingBottom: Spacing.five,
    alignItems: "center",
  },
  step: {
    fontSize: 14,
    fontWeight: "500",
  },
  title: {
    marginTop: Spacing.three,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "500",
    textAlign: "center",
  },
  subtitle: {
    marginTop: Spacing.three,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  email: {
    textDecorationLine: "underline",
  },
  codeRow: {
    marginTop: Spacing.five,
    flexDirection: "row",
    gap: Spacing.two,
  },
  box: {
    width: 46,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  digit: {
    fontSize: 22,
    fontWeight: "500",
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.01,
    color: "transparent",
  },
  verify: {
    alignSelf: "stretch",
    marginTop: Spacing.four,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyText: {
    fontSize: 15,
    fontWeight: "600",
  },
  dimmed: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
  },
  link: {
    marginTop: Spacing.four,
    fontSize: 15,
    textAlign: "center",
  },
  linkActive: {
    fontWeight: "500",
  },
});
