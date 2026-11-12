import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput } from "@/components/text";
import { SafeAreaView } from "react-native-safe-area-context";

import { PasswordField } from "@/components/password-field";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function Login() {
  const router = useRouter();
  const theme = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

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
          onPress={() => router.push("/page4")}
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
          Account Login
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

          <PasswordField
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            autoComplete="password"
          />

          <View style={styles.optionsRow}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}
              onPress={() => setRememberMe((v) => !v)}
              style={styles.remember}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: rememberMe
                      ? theme.brand
                      : theme.backgroundSelected,
                  },
                ]}
              >
                {rememberMe && (
                  <SymbolView
                    name={{ ios: "checkmark", android: "check", web: "check" }}
                    tintColor={theme.onBrand}
                    size={10}
                  />
                )}
              </View>
              <Text style={[styles.small, { color: theme.textSecondary }]}>
                Remember me
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/forgotPassword")}
            >
              <Text style={[styles.small, { color: theme.text }]}>
                Forgot Password?
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/home")}
          style={({ pressed }) => [
            styles.loginButton,
            { backgroundColor: theme.brand },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.loginText, { color: theme.onBrand }]}>
            Log In
          </Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View
            style={[styles.line, { backgroundColor: theme.backgroundSelected }]}
          />
          <Text style={[styles.small, { color: theme.textSecondary }]}>
            Or Sign In with
          </Text>
          <View
            style={[styles.line, { backgroundColor: theme.backgroundSelected }]}
          />
        </View>

        <View style={styles.socialRow}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.socialButton,
              { backgroundColor: theme.greyButton },
              pressed && styles.pressed,
            ]}
          >
            <Image
              source={require("@/assets/images/common/Google__G__logo.svg 1.png")}
              style={styles.google}
              contentFit="contain"
            />
            <Text style={[styles.socialText, { color: theme.textSecondary }]}>
              Google
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.socialButton,
              { backgroundColor: theme.greyButton },
              pressed && styles.pressed,
            ]}
          >
            <Image
              source={require("@/assets/images/common/Apple Logo.png")}
              style={styles.apple}
              contentFit="contain"
              tintColor={theme.text}
            />
            <Text style={[styles.socialText, { color: theme.textSecondary }]}>
              Apple
            </Text>
          </Pressable>
        </View>

        <View style={styles.signUpRow}>
          <Text style={[styles.small, { color: theme.textSecondary }]}>
            don't have an account yet?
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/signup")}
          >
            <Text style={[styles.small, styles.bold, { color: theme.text }]}>
              Sign Up
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
    marginTop: Spacing.three,
  },
  form: {
    marginTop: Spacing.five,
    gap: 14,
  },
  input: {
    height: 44,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
  },
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  remember: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
  },
  bold: {
    fontWeight: "600",
  },
  loginButton: {
    marginTop: Spacing.five,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
  dividerRow: {
    marginTop: Spacing.four,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  socialRow: {
    marginTop: Spacing.three,
    flexDirection: "row",
    gap: 14,
  },
  socialButton: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  google: {
    width: 20,
    height: 20,
  },
  apple: {
    width: 17,
    height: 20,
  },
  socialText: {
    fontSize: 13,
  },
  signUpRow: {
    marginTop: Spacing.four,
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.one,
  },
});
