import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";

import { formatNaira } from "@/constants/currency";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type QuantityBarProps = {
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  /** Price of one voucher, in naira */
  unitPrice: number;
  onAdd: () => void;
};

/** Quantity stepper and the "Add N…" button. The caller supplies the surrounding bar. */
export function QuantityBar({
  quantity,
  maxQuantity,
  onQuantityChange,
  unitPrice,
  onAdd,
}: QuantityBarProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.stepper, { borderColor: theme.chip }]}>
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
            size={24}
          />
        </Pressable>
        <Text style={[styles.quantity, { color: theme.text }]}>{quantity}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Increase quantity"
          disabled={quantity >= maxQuantity}
          hitSlop={8}
          onPress={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
          style={quantity >= maxQuantity && styles.disabled}
        >
          <SymbolView
            name={{
              ios: "plus.circle",
              android: "add_circle_outline",
              web: "add_circle_outline",
            }}
            tintColor={theme.eyeIcon}
            size={24}
          />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onAdd}
        style={({ pressed }) => [
          styles.add,
          { backgroundColor: theme.brand },
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.addText, { color: theme.onBrand }]}>
          Add {formatNaira(unitPrice * quantity)}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  stepper: {
    height: 52,
    paddingHorizontal: Spacing.three - Spacing.one,
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three - Spacing.one,
  },
  disabled: {
    opacity: 0.4,
  },
  quantity: {
    minWidth: 24,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  add: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    fontSize: 15,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.85,
  },
});
