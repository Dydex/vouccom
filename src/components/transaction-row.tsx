import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";

import { formatNaira } from "@/constants/currency";
import { Spacing } from "@/constants/theme";
import type { Transaction } from "@/data/wallet";
import { useTheme } from "@/hooks/use-theme";

function signedNaira(amount: number): string {
  return `${amount >= 0 ? "+" : "-"}${formatNaira(Math.abs(amount))}`;
}

/** One wallet transaction: an arrow in or out, the title and time, and the amount. */
export function TransactionRow({
  tx,
  onPress,
}: {
  tx: Transaction;
  onPress: () => void;
}) {
  const theme = useTheme();
  const incoming = tx.amount >= 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${tx.title}, ${signedNaira(tx.amount)}. View details`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.card },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.logo,
          { backgroundColor: incoming ? theme.moneyInBg : theme.moneyOutBg },
        ]}
      >
        <Image
          source={
            incoming
              ? require("@/assets/images/common/Arrow Up.png")
              : require("@/assets/images/common/Arrow Down.png")
          }
          style={styles.arrow}
          contentFit="contain"
          tintColor={incoming ? theme.moneyIn : theme.moneyOut}
        />
      </View>

      <View style={styles.text}>
        <Text style={[styles.title, { color: theme.text }]}>{tx.title}</Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          {tx.time}
        </Text>
      </View>

      <View style={styles.amountColumn}>
        <Text
          style={[
            styles.amount,
            { color: incoming ? theme.moneyIn : theme.moneyOut },
          ]}
        >
          {signedNaira(tx.amount)}
        </Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          view details
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 58,
    borderRadius: 22,
    paddingHorizontal: Spacing.two + Spacing.one,
    paddingVertical: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three - Spacing.one,
  },
  pressed: {
    opacity: 0.85,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    width: 20,
    height: 20, // Arrow Up.png and Arrow Down.png are 4x exports (80x80)
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
  },
  meta: {
    fontSize: 11,
  },
  amountColumn: {
    alignItems: "flex-end",
    gap: Spacing.half,
  },
  amount: {
    fontSize: 14,
    fontWeight: "500",
  },
});
