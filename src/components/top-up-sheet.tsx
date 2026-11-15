import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/bottom-sheet";
import { Text, TextInput } from "@/components/text";
import { CURRENCY_SYMBOL, formatNaira } from "@/constants/currency";
import { Spacing } from "@/constants/theme";
import { useStartTopUp } from "@/hooks/use-checkout";
import { useTheme } from "@/hooks/use-theme";
import { ApiError, MAX_TOP_UP_NAIRA, MIN_TOP_UP_NAIRA } from "@/lib/api";

const QUICK_AMOUNTS = [1_000, 5_000, 10_000, 20_000];

function withCommas(digits: string) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

type TopUpSheetProps = {
  visible: boolean;
  onClose: () => void;
};

/** "Top up" pop-up: pick an amount, then pay for it on Paystack. */
export function TopUpSheet({ visible, onClose }: TopUpSheetProps) {
  const theme = useTheme();
  const topUp = useStartTopUp();
  const resetTopUp = topUp.reset;

  // Digits only, e.g. "5000".
  const [digits, setDigits] = useState("");

  useEffect(() => {
    if (visible) {
      setDigits("");
      resetTopUp();
    }
  }, [visible, resetTopUp]);

  const amount = Number(digits || 0);
  const tooSmall = digits !== "" && amount < MIN_TOP_UP_NAIRA;
  const tooBig = amount > MAX_TOP_UP_NAIRA;
  const valid = amount >= MIN_TOP_UP_NAIRA && !tooBig;

  const proceed = () => {
    if (!valid || topUp.isPending) return;
    topUp.mutate(amount, {
      onSuccess: ({ authorizationUrl, reference }) => {
        onClose();
        router.push({
          pathname: "/payment",
          params: { url: authorizationUrl, reference, kind: "topup" },
        });
      },
    });
  };

  const hint = tooSmall
    ? `The minimum top-up is ${formatNaira(MIN_TOP_UP_NAIRA)}.`
    : tooBig
      ? `The maximum top-up is ${formatNaira(MAX_TOP_UP_NAIRA)}.`
      : topUp.isError
        ? topUp.error instanceof ApiError
          ? topUp.error.message
          : "Couldn't start the top-up. Please try again."
        : null;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Top up wallet"
      footer={
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !valid, busy: topUp.isPending }}
          disabled={!valid || topUp.isPending}
          onPress={proceed}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.brand },
            !valid && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          {topUp.isPending ? (
            <ActivityIndicator color={theme.onBrand} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.onBrand }]}>
              {valid ? `Top up ${formatNaira(amount)}` : "Top up"}
            </Text>
          )}
        </Pressable>
      }
    >
      <View style={styles.content}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Amount
        </Text>
        <View style={[styles.field, { backgroundColor: theme.card }]}>
          <Text style={[styles.currency, { color: theme.text }]}>
            {CURRENCY_SYMBOL}
          </Text>
          <TextInput
            value={withCommas(digits)}
            onChangeText={(text) =>
              setDigits(text.replace(/\D/g, "").replace(/^0+/, ""))
            }
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={theme.placeholder}
            accessibilityLabel="Amount in naira"
            maxLength={9}
            style={[styles.input, { color: theme.text }]}
          />
        </View>

        <View style={styles.quick}>
          {QUICK_AMOUNTS.map((value) => {
            const selected = amount === value;
            return (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setDigits(String(value))}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? theme.brand : theme.greyButton,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: selected ? theme.onBrand : theme.text },
                  ]}
                >
                  {formatNaira(value)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {hint && (
          <Text style={[styles.hint, { color: theme.coral }]}>{hint}</Text>
        )}

        <Text style={[styles.note, { color: theme.textSecondary }]}>
          You'll pay securely on Paystack.
        </Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
  },
  label: {
    fontSize: 13,
  },
  field: {
    height: 64,
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  currency: {
    fontSize: 28,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: "500",
  },
  quick: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  chip: {
    height: 36,
    paddingHorizontal: Spacing.three,
    borderRadius: 18,
    justifyContent: "center",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  hint: {
    fontSize: 13,
  },
  note: {
    fontSize: 12,
  },
  button: {
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
