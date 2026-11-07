import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DEFAULT_COUNTRY, type Country } from "@/components/country-picker";
import { PhoneField } from "@/components/phone-field";
import { useToast } from "@/components/toast";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function ForgotPassword() {
  const router = useRouter();
  const theme = useTheme();
  const toast = useToast();

  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");

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
          Don't fret! Just type in your registered phone number and we will send
          you a code to reset your password
        </Text>

        <View style={styles.form}>
          <PhoneField
            country={country}
            onCountryChange={setCountry}
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            toast.show({
              title: "Check your email",
              message: "We've sent reset instructions to your mail",
            });
            router.replace({ pathname: "/passwordReset", params: { phone } });
          }}
          style={({ pressed }) => [
            styles.submit,
            { backgroundColor: theme.brand },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.submitText, { color: theme.onBrand }]}>
            Reset password
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
