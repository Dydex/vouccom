import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput } from "@/components/text";
import { SafeAreaView } from "react-native-safe-area-context";

import { DEFAULT_COUNTRY, type Country } from "@/components/country-picker";
import { PasswordField } from "@/components/password-field";
import { PhoneField } from "@/components/phone-field";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function Signup() {
  const router = useRouter();
  const theme = useTheme();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const fieldStyle = [
    styles.input,
    { backgroundColor: theme.greyButton, color: theme.text },
  ];

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
          Create an account
        </Text>

        <View style={styles.form}>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
            placeholderTextColor={theme.placeholder}
            autoComplete="given-name"
            style={fieldStyle}
          />
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
            placeholderTextColor={theme.placeholder}
            autoComplete="family-name"
            style={fieldStyle}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={theme.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={fieldStyle}
          />

          <PhoneField
            country={country}
            onCountryChange={setCountry}
            value={phone}
            onChangeText={setPhone}
          />

          <PasswordField
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
          />
          <PasswordField
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
          />

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreed }}
            onPress={() => setAgreed((v) => !v)}
            style={styles.terms}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: agreed ? theme.brand : theme.prefix,
                },
              ]}
            >
              {agreed && (
                <SymbolView
                  name={{ ios: "checkmark", android: "check", web: "check" }}
                  tintColor={theme.onBrand}
                  size={10}
                />
              )}
            </View>
            <Text style={[styles.small, { color: theme.textSecondary }]}>
              I agree to the{" "}
              <Text style={[styles.underline, { color: theme.textSecondary }]}>
                Terms & Conditions
              </Text>
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/home")}
          style={({ pressed }) => [
            styles.submit,
            { backgroundColor: theme.brand },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.submitText, { color: theme.onBrand }]}>
            Get Started
          </Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View
            style={[styles.line, { backgroundColor: theme.backgroundSelected }]}
          />
          <Text style={[styles.small, { color: theme.textSecondary }]}>
            Or register with
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

        <View style={styles.signInRow}>
          <Text style={[styles.small, { color: theme.textSecondary }]}>
            already have an account?
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/login")}
          >
            <Text style={[styles.small, styles.bold, { color: theme.text }]}>
              Sign In
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
  terms: {
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
  underline: {
    textDecorationLine: "underline",
  },
  bold: {
    fontWeight: "600",
  },
  submit: {
    marginTop: Spacing.four,
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
  signInRow: {
    marginTop: Spacing.four,
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.one,
  },
});
