import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PasswordField } from "@/components/password-field";
import { useToast } from "@/components/toast";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function ChangePassword() {
  const router = useRouter();
  const theme = useTheme();
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
          // TODO: check the two passwords match and save the new one before this
          onPress={() => {
            toast.show({ message: "Password changed successfully." });
            router.replace("/login");
          }}
          style={({ pressed }) => [
            styles.confirm,
            { backgroundColor: theme.brand },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.confirmText, { color: theme.onBrand }]}>
            Confirm
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
    height: 14, // backarrow.png is a 4x export (72x56)
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
