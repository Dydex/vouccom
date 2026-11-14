import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput } from "@/components/text";
import { SafeAreaView } from "react-native-safe-area-context";

import { useToast } from "@/components/toast";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ApiError, forgotPassword } from "@/lib/api";

export default function ForgotPassword() {
  const router = useRouter();
  const theme = useTheme();
  const toast = useToast();

  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? "");
  const [submitting, setSubmitting] = useState(false);

  const sendCode = async () => {
    const address = email.trim();
    if (!address) {
      toast.show({ tone: "error", message: "Enter your email address." });
      return;
    }

    setSubmitting(true);
    try {
      await forgotPassword(address);
      toast.show({
        title: "Check your email",
        message: "If an account uses this email, we've sent it a 6-digit code.",
      });
      router.push({ pathname: "/passwordReset", params: { email: address } });
    } catch (error) {
      toast.show({
        tone: "error",
        message:
          error instanceof ApiError
            ? error.message
            : "Couldn't send the code. Please try again.",
      });
    } finally {
      setSubmitting(false);
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
          Forgot your password?
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Don't fret! Just type in your registered email address and we will
          send you a code to reset your password
        </Text>

        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={theme.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={[
              styles.input,
              { backgroundColor: theme.greyButton, color: theme.text },
            ]}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: submitting, disabled: submitting }}
          disabled={submitting}
          onPress={sendCode}
          style={({ pressed }) => [
            styles.submit,
            { backgroundColor: theme.brand },
            (pressed || submitting) && styles.pressed,
          ]}
        >
          <Text style={[styles.submitText, { color: theme.onBrand }]}>
            {submitting ? "Sending code..." : "Reset password"}
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
  form: {
    marginTop: Spacing.five,
  },
  input: {
    height: 44,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
  },
  submit: {
    marginTop: Spacing.four - Spacing.one,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
});
