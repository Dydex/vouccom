import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { SafeAreaView } from "react-native-safe-area-context";

import { PasswordField } from "@/components/password-field";
import { useToast } from "@/components/toast";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ApiError, changePassword, resetPassword } from "@/lib/api";

export default function ChangePassword() {
  const router = useRouter();
  const theme = useTheme();
  const toast = useToast();

  // With a code we're finishing "forgot password"; without one, a signed-in
  // user is changing their password from Security & Privacy.
  const { email = "", code } = useLocalSearchParams<{
    email?: string;
    code?: string;
  }>();
  const resetting = Boolean(code);

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const confirm = async () => {
    if (!resetting && !currentPassword) {
      toast.show({ tone: "error", message: "Enter your current password." });
      return;
    }
    if (password.length < 8) {
      toast.show({
        tone: "error",
        message: "Your new password needs at least 8 characters.",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast.show({ tone: "error", message: "Passwords do not match." });
      return;
    }

    setSubmitting(true);
    try {
      if (resetting) {
        await resetPassword(email, code!, password);
        toast.show({
          tone: "success",
          message: "Password changed. Sign in with your new password.",
        });
        // Close the whole reset flow rather than stacking a second login on top.
        router.dismissTo({ pathname: "/login", params: { email } });
      } else {
        await changePassword(currentPassword, password);
        toast.show({ tone: "success", message: "Password changed." });
        router.back();
      }
    } catch (error) {
      toast.show({
        tone: "error",
        message:
          error instanceof ApiError
            ? error.message
            : "Couldn't change your password. Please try again.",
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
          Change your password
        </Text>

        <View style={styles.form}>
          {!resetting && (
            <PasswordField
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current Password"
              autoComplete="current-password"
            />
          )}
          <PasswordField
            value={password}
            onChangeText={setPassword}
            placeholder="New Password"
          />
          <PasswordField
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: submitting, disabled: submitting }}
          disabled={submitting}
          onPress={confirm}
          style={({ pressed }) => [
            styles.confirm,
            { backgroundColor: theme.brand },
            (pressed || submitting) && styles.pressed,
          ]}
        >
          <Text style={[styles.confirmText, { color: theme.onBrand }]}>
            {submitting ? "Saving..." : "Confirm"}
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
  form: {
    marginTop: Spacing.five,
    gap: 14,
  },
  confirm: {
    marginTop: Spacing.four - Spacing.one,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
});
