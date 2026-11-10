import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useEffect, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BottomSheet } from "@/components/bottom-sheet";
import { formatNaira } from "@/constants/currency";
import { Spacing } from "@/constants/theme";
import { SAVED_CARDS, WALLET_BALANCE } from "@/data/wallet";
import { useTheme } from "@/hooks/use-theme";

const PROVIDERS = [
  {
    id: "paystack",
    label: "Paystack",
    logo: require("@/assets/images/payments/paystack.png"),
    // The exports are 4x, so these are a quarter of the pixel size.
    logoWidth: 21,
    logoHeight: 23,
  },
  {
    id: "flutterwave",
    label: "Flutterwave",
    logo: require("@/assets/images/payments/flutterwave.png"),
    logoWidth: 24,
    logoHeight: 21,
  },
] as const;

type PaymentMethod = string; // a saved card id, "wallet", "paystack" or "flutterwave"

type CheckoutSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** e.g. "2026 Honda Civic voucher" */
  itemName: string;
  /** Price of one voucher, in naira */
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  /** Called when the user removes the item from the order. */
  onRemove: () => void;
  onProceed?: (method: PaymentMethod) => void;
};

export function CheckoutSheet({
  visible,
  onClose,
  itemName,
  unitPrice,
  quantity,
  maxQuantity,
  onQuantityChange,
  onRemove,
  onProceed,
}: CheckoutSheetProps) {
  const theme = useTheme();

  const [method, setMethod] = useState<PaymentMethod>(
    SAVED_CARDS[0]?.id ?? "wallet",
  );

  // Start from the first saved card each time the sheet opens.
  useEffect(() => {
    if (visible) setMethod(SAVED_CARDS[0]?.id ?? "wallet");
  }, [visible]);

  const total = unitPrice * quantity;
  const insufficient = method === "wallet" && total > WALLET_BALANCE;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Checkout"
      tall
      footer={
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: insufficient }}
          disabled={insufficient}
          // TODO: take the payment, then show the order confirmation.
          onPress={() => onProceed?.(method)}
          style={({ pressed }) => [
            styles.proceed,
            { backgroundColor: theme.brand },
            insufficient && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.proceedText, { color: theme.onBrand }]}>
            Proceed
          </Text>
        </Pressable>
      }
    >
      {/* One child, so the sheet's own section spacing doesn't apply here. */}
      <View style={styles.content}>
        {/* Order line */}
        <View style={styles.itemRow}>
          <View style={styles.itemLeft}>
            <Text style={[styles.text, { color: theme.text }]}>{itemName}</Text>
            <View style={styles.stepper}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrease quantity"
                disabled={quantity <= 1}
                hitSlop={8}
                onPress={() => onQuantityChange(Math.max(1, quantity - 1))}
                style={quantity <= 1 && styles.disabled}
              >
                <SymbolView
                  name={{
                    ios: "minus.circle",
                    android: "remove_circle_outline",
                    web: "remove_circle_outline",
                  }}
                  tintColor={theme.eyeIcon}
                  size={26}
                />
              </Pressable>
              <Text style={[styles.quantity, { color: theme.text }]}>
                {quantity}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increase quantity"
                disabled={quantity >= maxQuantity}
                hitSlop={8}
                onPress={() =>
                  onQuantityChange(Math.min(maxQuantity, quantity + 1))
                }
                style={quantity >= maxQuantity && styles.disabled}
              >
                <SymbolView
                  name={{
                    ios: "plus.circle",
                    android: "add_circle_outline",
                    web: "add_circle_outline",
                  }}
                  tintColor={theme.eyeIcon}
                  size={26}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.itemRight}>
            <Text style={[styles.text, styles.heavy, { color: theme.text }]}>
              {formatNaira(total)}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${itemName}`}
              hitSlop={8}
              onPress={onRemove}
            >
              <Text style={[styles.remove, { color: theme.textSecondary }]}>
                remove
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.greyButton }]} />
        <View style={styles.totalRow}>
          <Text style={[styles.text, { color: theme.text }]}>Total</Text>
          <Text style={[styles.text, styles.heavy, { color: theme.text }]}>
            {formatNaira(total)}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.greyButton }]} />

        {/* Payment method */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Select payment method
        </Text>

        {SAVED_CARDS.map((card) => (
          <MethodRow
            key={card.id}
            selected={method === card.id}
            onPress={() => setMethod(card.id)}
            left={
              <Image
                source={require("@/assets/images/payments/visa.png")}
                style={styles.visa}
                contentFit="contain"
                accessibilityLabel={card.brand}
              />
            }
            label={`${card.brand} **** ${card.last4}`}
            right={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Card options"
                hitSlop={10}
                // TODO: card options (remove / set default).
              >
                <SymbolView
                  name={{
                    ios: "ellipsis",
                    android: "more_horiz",
                    web: "more_horiz",
                  }}
                  tintColor={theme.text}
                  size={18}
                />
              </Pressable>
            }
          />
        ))}

        <MethodRow
          selected={method === "wallet"}
          onPress={() => setMethod("wallet")}
          left={
            <Image
              source={require("@/assets/images/tabIcons/Wallet.png")}
              style={styles.walletIcon}
              contentFit="contain"
              tintColor={theme.text}
            />
          }
          label="My Wallet"
          right={
            <Text style={[styles.balance, styles.heavy, { color: theme.text }]}>
              Bal. {formatNaira(WALLET_BALANCE)}
            </Text>
          }
        />

        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          // TODO: add-card flow.
          style={styles.addCard}
        >
          <Text style={[styles.text, styles.heavy, { color: theme.text }]}>
            Add a new card
          </Text>
        </Pressable>

        {/* Other providers */}
        <View style={styles.orRow}>
          <View
            style={[styles.orLine, { backgroundColor: theme.greyButton }]}
          />
          <Text style={[styles.orText, { color: theme.textSecondary }]}>
            or pay with
          </Text>
          <View
            style={[styles.orLine, { backgroundColor: theme.greyButton }]}
          />
        </View>

        <View style={styles.providers}>
          {PROVIDERS.map((p) => (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              accessibilityState={{ selected: method === p.id }}
              onPress={() => setMethod(p.id)}
              style={[
                styles.provider,
                {
                  backgroundColor: theme.greyButton,
                  borderColor: method === p.id ? theme.brand : "transparent",
                },
              ]}
            >
              <Image
                source={p.logo}
                style={{ width: p.logoWidth, height: p.logoHeight }}
                contentFit="contain"
              />
              <Text
                style={[styles.providerText, { color: theme.textSecondary }]}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* TODO: replace with the real terms copy. */}
        <Text style={[styles.terms, { color: theme.textSecondary }]}>
          By placing your order you consent to our Terms of Use.
        </Text>

        {insufficient && (
          <Text style={[styles.warning, { color: theme.coral }]}>
            Your wallet balance is too low for this order.
          </Text>
        )}
      </View>
    </BottomSheet>
  );
}

function MethodRow({
  selected,
  onPress,
  left,
  label,
  right,
}: {
  selected: boolean;
  onPress: () => void;
  left: ReactNode;
  label: string;
  right: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.method,
        {
          backgroundColor: theme.card,
          borderColor: selected ? theme.brand : "transparent",
        },
      ]}
    >
      <View style={styles.methodLeft}>{left}</View>
      <Text style={[styles.methodLabel, { color: theme.text }]}>{label}</Text>
      {right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  itemLeft: {
    flex: 1,
    gap: Spacing.two,
  },
  itemRight: {
    alignItems: "flex-end",
    gap: Spacing.one,
  },
  // The mockups are shown at ~89% scale, so these are the measured sizes scaled back up.
  text: {
    fontSize: 15,
  },
  // The amounts and "Add a new card" are set heavier than the labels around them.
  heavy: {
    fontWeight: "500",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three - Spacing.one,
  },
  quantity: {
    minWidth: 24,
    textAlign: "center",
    fontSize: 16,
  },
  remove: {
    fontSize: 13,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.one,
  },
  sectionLabel: {
    fontSize: 15,
    marginTop: Spacing.one,
  },
  method: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  methodLeft: {
    width: 30,
    alignItems: "center",
  },
  methodLabel: {
    flex: 1,
    fontSize: 15,
  },
  visa: {
    width: 30, // visa.png is a 4x export (118x67)
    height: 17,
  },
  walletIcon: {
    width: 20,
    height: 15,
  },
  balance: {
    fontSize: 14,
  },
  addCard: {
    alignItems: "center",
    paddingVertical: Spacing.two,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  orText: {
    fontSize: 12,
  },
  providers: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  provider: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  providerText: {
    fontSize: 14,
  },
  terms: {
    fontSize: 10,
    lineHeight: 14,
  },
  warning: {
    fontSize: 12,
    textAlign: "center",
  },
  proceed: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  proceedText: {
    fontSize: 16,
    fontWeight: "500",
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
});
