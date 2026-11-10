import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { BottomSheet } from "@/components/bottom-sheet";
import { CardLogo } from "@/components/card-logo";
import { Spacing } from "@/constants/theme";
import type { CardBrand, SavedCard } from "@/data/wallet";
import { useTheme } from "@/hooks/use-theme";

/** What the form hands back. The full number and CVV are never kept. */
export type CardFormResult = {
  brand: CardBrand;
  last4: string;
  /** "MM/YY" */
  expires: string;
  name: string;
  setAsDefault: boolean;
};

type CardFormSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Leave out to add a new card; pass a saved card to update it. */
  card?: SavedCard;
  onSubmit: (result: CardFormResult) => void;
};

function detectBrand(digits: string): CardBrand | null {
  if (/^4/.test(digits)) return "VISA";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return "Mastercard";
  return null;
}

function luhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let n = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return digits.length > 0 && sum % 10 === 0;
}

function expiryValid(value: string, now = new Date()): boolean {
  const m = value.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  return (
    year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1)
  );
}

const groupDigits = (digits: string) => digits.replace(/(\d{4})(?=\d)/g, "$1 ");

function formatExpiry(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
}

export function CardFormSheet({
  visible,
  onClose,
  card,
  onSubmit,
}: CardFormSheetProps) {
  const theme = useTheme();
  const editing = card !== undefined;

  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Each time the sheet opens: empty for a new card, filled in when editing one.
  // (The CVV is never stored, so it always starts empty.)
  useEffect(() => {
    if (!visible) return;
    setNumber("");
    setExpiry(card?.expires ?? "");
    setCvv("");
    setName(card?.name ?? "");
    setAgreed(false);
  }, [visible, card]);

  const digits = number.replace(/\D/g, "");
  const brand = card ? card.brand : detectBrand(digits);
  const numberOk =
    editing || (brand !== null && digits.length >= 13 && luhn(digits));
  const valid =
    numberOk &&
    expiryValid(expiry) &&
    /^\d{3,4}$/.test(cvv) &&
    name.trim().length > 1 &&
    agreed;

  const submit = (setAsDefault: boolean) => {
    if (!valid || !brand) return;
    // TODO: send the card to the payment provider (Paystack / Flutterwave) to be
    // tokenised, and keep only the token they return.
    onSubmit({
      brand,
      last4: card ? card.last4 : digits.slice(-4),
      expires: expiry,
      name: name.trim(),
      setAsDefault,
    });
    onClose();
  };

  const verb = editing ? "Update" : "Add new card";

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={editing ? "Update payment details" : "Add a new card"}
      footer={
        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !valid }}
            disabled={!valid}
            onPress={() => submit(true)}
            // Stays solid, with black text, even while the form is incomplete.
            style={[styles.button, { backgroundColor: theme.greyButton }]}
          >
            <Text style={[styles.buttonText, { color: theme.text }]}>
              {editing ? "Update & set as default" : "Add & set as default"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !valid }}
            disabled={!valid}
            onPress={() => submit(false)}
            // Only the blue fill fades while the form is incomplete; the text stays solid.
            style={[
              styles.button,
              { backgroundColor: valid ? theme.brand : `${theme.brand}80` },
            ]}
          >
            <Text style={[styles.buttonText, { color: theme.onBrand }]}>
              {verb}
            </Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.form}>
        <View style={styles.logos}>
          <CardLogo brand="Mastercard" />
          <CardLogo brand="VISA" />
        </View>

        <FloatingInput
          label="Card number"
          // The number of a saved card is shown masked and can't be changed.
          value={card ? `**** **** **** ${card.last4}` : groupDigits(digits)}
          onChangeText={(t) => setNumber(t.replace(/\D/g, "").slice(0, 19))}
          editable={!editing}
          keyboardType="number-pad"
          autoComplete="cc-number"
          textContentType="creditCardNumber"
          right={
            <SymbolView
              name={{
                ios: "creditcard",
                android: "credit_card",
                web: "credit_card",
              }}
              tintColor={theme.eyeIcon}
              size={18}
            />
          }
        />

        <View style={styles.pair}>
          <View style={styles.half}>
            <FloatingInput
              label="Expiration date"
              value={expiry}
              onChangeText={(t) => setExpiry(formatExpiry(t))}
              keyboardType="number-pad"
              autoComplete="cc-exp"
            />
          </View>
          <View style={styles.half}>
            <FloatingInput
              label="CVV"
              value={cvv}
              onChangeText={(t) => setCvv(t.replace(/\D/g, "").slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              autoComplete="cc-csc"
              right={
                <SymbolView
                  name={{
                    ios: "questionmark.circle",
                    android: "help",
                    web: "help",
                  }}
                  tintColor={theme.eyeIcon}
                  size={20}
                />
              }
            />
          </View>
        </View>

        <FloatingInput
          label="Name on card"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="cc-name"
        />

        <Text style={[styles.fine, { color: theme.textSecondary }]}>
          Your payment may be processed through our secure payment partners.
          Additional bank or payment provider fees may apply.
        </Text>
        <Text style={[styles.fine, { color: theme.textSecondary }]}>
          By checking the box below, you confirm that you have reviewed the
          details of this purchase and agree to VOUCCOM's Terms & Conditions and
          Privacy Policy. You authorise VOUCCOM to charge your selected payment
          method for this one-time voucher purchase.
        </Text>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
          onPress={() => setAgreed((v) => !v)}
          style={styles.agree}
        >
          <View
            style={[
              styles.box,
              { backgroundColor: agreed ? theme.brand : theme.chip },
            ]}
          >
            {agreed && (
              <SymbolView
                name={{ ios: "checkmark", android: "check", web: "check" }}
                tintColor={theme.onBrand}
                weight="bold"
                size={11}
              />
            )}
          </View>
          <Text style={[styles.agreeText, { color: theme.textSecondary }]}>
            I agree to the{" "}
            <Text style={[styles.link, { color: theme.text }]}>
              Terms & Conditions
            </Text>
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

/** A pill-shaped input whose label shrinks above the value once it has focus or text. */
function FloatingInput({
  label,
  value,
  right,
  editable = true,
  ...rest
}: TextInputProps & { label: string; value: string; right?: React.ReactNode }) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <View style={[styles.input, { backgroundColor: theme.greyButton }]}>
      {floated && (
        <Text style={[styles.floatLabel, { color: theme.placeholder }]}>
          {label}
        </Text>
      )}
      <TextInput
        {...rest}
        value={value}
        editable={editable}
        placeholder={floated ? undefined : label}
        placeholderTextColor={theme.placeholder}
        accessibilityLabel={label}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          styles.field,
          { color: editable ? theme.text : theme.textSecondary },
          right ? styles.withIcon : undefined,
        ]}
      />
      {right && (
        <View style={styles.icon} pointerEvents="none">
          {right}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // One child, so the sheet's own section spacing doesn't apply here.
  form: {
    gap: Spacing.three - Spacing.one,
  },
  logos: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: Spacing.one,
  },
  input: {
    minHeight: 54,
    borderRadius: 27,
    paddingHorizontal: Spacing.three,
    justifyContent: "center",
  },
  floatLabel: {
    fontSize: 10,
  },
  field: {
    height: 22,
    padding: 0,
    fontSize: 14,
  },
  withIcon: {
    paddingRight: 34,
  },
  icon: {
    position: "absolute",
    right: Spacing.three,
  },
  pair: {
    flexDirection: "row",
    gap: Spacing.three - Spacing.one,
  },
  half: {
    flex: 1,
  },
  fine: {
    fontSize: 10,
    lineHeight: 14,
  },
  agree: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two + Spacing.one,
    paddingTop: Spacing.one,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  agreeText: {
    fontSize: 13,
  },
  link: {
    textDecorationLine: "underline",
  },
  footer: {
    gap: Spacing.two + Spacing.one,
  },
  button: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
