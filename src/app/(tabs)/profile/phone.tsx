import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { CodeInput } from "@/components/code-input";
import { DEFAULT_COUNTRY, type Country } from "@/components/country-picker";
import { PhoneField } from "@/components/phone-field";
import { PlainHeader } from "@/components/plain-header";
import { Text } from "@/components/text";
import { useToast } from "@/components/toast";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  ApiError,
  addPhone,
  requestPhoneCode,
  verifyPhone,
  type User,
} from "@/lib/api";
import { maskPhone } from "@/lib/format";
import { useAuth } from "@/state/auth";

const CODE_LENGTH = 6;
const RESEND_AFTER_SECONDS = 60;

/** Add a phone number (if the account has none), then verify it with a code. */
export default function PhoneScreen() {
  const theme = useTheme();
  const toast = useToast();
  const { user, updateUser, refreshUser } = useAuth();

  // The number being verified: the account's, or the one just added.
  const [phone, setPhone] = useState<string | null>(user?.phone ?? null);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PlainHeader
        title={phone ? "Verify phone number" : "Add phone number"}
        fallback="/profile/details"
      />

      {phone ? (
        <CodeStep
          phone={phone}
          onVerified={async () => {
            await refreshUser();
            toast.show({ tone: "success", message: "Phone number verified." });
            router.back();
          }}
        />
      ) : (
        <AddStep
          onAdded={(added) => {
            updateUser(added.user);
            setPhone(added.user.phone ?? added.digits);
          }}
        />
      )}
    </View>
  );
}

function AddStep({
  onAdded,
}: {
  onAdded: (added: { user: User; digits: string }) => void;
}) {
  const theme = useTheme();
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [number, setNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  // The API expects digits without the leading 0, as at sign-up.
  const digits = number.replace(/\D/g, "").replace(/^0/, "");
  const ready = digits.length >= 7 && !saving;

  const save = async () => {
    if (!ready) return;
    setSaving(true);
    setError(undefined);
    try {
      const { user } = await addPhone(digits);
      onAdded({ user, digits });
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Couldn't add your phone number.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Add a phone number to your account. We'll send it a code to confirm it's
        yours.
      </Text>

      <View style={styles.field}>
        <PhoneField
          country={country}
          onCountryChange={setCountry}
          value={number}
          onChangeText={setNumber}
        />
      </View>

      {error && (
        <Text style={[styles.error, { color: theme.coral }]}>{error}</Text>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !ready, busy: saving }}
        disabled={!ready}
        onPress={save}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.brand },
          !ready && !saving && styles.dimmed,
          pressed && styles.pressed,
        ]}
      >
        {saving ? (
          <ActivityIndicator color={theme.onBrand} />
        ) : (
          <Text style={[styles.buttonText, { color: theme.onBrand }]}>
            Continue
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function CodeStep({
  phone,
  onVerified,
}: {
  phone: string;
  onVerified: () => Promise<void>;
}) {
  const theme = useTheme();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_AFTER_SECONDS);

  const send = async () => {
    try {
      const result = await requestPhoneCode(phone);
      // SMS isn't live yet; test servers send the code back instead.
      if (__DEV__ && result.devCode) {
        toast.show({ tone: "info", message: `Test code: ${result.devCode}` });
      } else if (!result.sent) {
        toast.show({
          tone: "info",
          message: "Text messages aren't available yet. Please try later.",
        });
      }
    } catch (e) {
      toast.show({
        tone: "error",
        message: e instanceof ApiError ? e.message : "Couldn't send the code.",
      });
    }
  };

  // Send the first code once per number; the ref also stops a second send in
  // React's development double-render.
  const sentTo = useRef<string | null>(null);
  useEffect(() => {
    if (sentTo.current === phone) return;
    sentTo.current = phone;
    send();
  }, [phone, send]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const resend = () => {
    setSecondsLeft(RESEND_AFTER_SECONDS);
    send();
  };

  const complete = code.length === CODE_LENGTH;

  const verify = async () => {
    if (!complete || verifying) return;
    setVerifying(true);
    try {
      const { verified } = await verifyPhone(phone, code);
      if (!verified) throw new Error("That code didn't work.");
      await onVerified();
    } catch (e) {
      setCode("");
      toast.show({
        tone: "error",
        message:
          e instanceof ApiError || e instanceof Error
            ? e.message
            : "Couldn't verify the code.",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.content, styles.centered]}
      keyboardShouldPersistTaps="handled"
    >
      <Text
        style={[styles.subtitle, styles.center, { color: theme.textSecondary }]}
      >
        Enter the 6-digit code we sent to{" "}
        <Text style={{ color: theme.text }}>{maskPhone(phone)}</Text>.
      </Text>

      <View style={styles.codeRow}>
        <CodeInput
          length={CODE_LENGTH}
          value={code}
          onChangeText={setCode}
          accessibilityLabel="Phone verification code"
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
          styles.button,
          { backgroundColor: theme.brand },
          (!complete || verifying) && styles.dimmed,
          pressed && styles.pressed,
        ]}
      >
        {verifying ? (
          <ActivityIndicator color={theme.onBrand} />
        ) : (
          <Text style={[styles.buttonText, { color: theme.onBrand }]}>
            Verify
          </Text>
        )}
      </Pressable>

      {secondsLeft > 0 ? (
        <Text style={[styles.link, { color: theme.textSecondary }]}>
          Resend code in {secondsLeft}s
        </Text>
      ) : (
        <Pressable accessibilityRole="button" onPress={resend} hitSlop={8}>
          <Text style={[styles.link, styles.linkActive, { color: theme.text }]}>
            Resend code
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  centered: {
    alignItems: "center",
  },
  center: {
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    marginTop: Spacing.two,
  },
  error: {
    fontSize: 13,
  },
  codeRow: {
    marginTop: Spacing.four,
  },
  button: {
    alignSelf: "stretch",
    marginTop: Spacing.three,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
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
    marginTop: Spacing.three,
    fontSize: 15,
    textAlign: "center",
  },
  linkActive: {
    fontWeight: "500",
  },
});
