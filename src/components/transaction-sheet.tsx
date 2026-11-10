import { Pressable, StyleSheet, Text, View } from "react-native";

import { BottomSheet } from "@/components/bottom-sheet";
import { formatNaira } from "@/constants/currency";
import { Spacing } from "@/constants/theme";
import type { Transaction, TransactionStatus } from "@/data/wallet";
import { useTheme } from "@/hooks/use-theme";

const STATUS_LABELS: Record<TransactionStatus, string> = {
  successful: "Successful",
  pending: "Pending",
  failed: "Failed",
};

type TransactionSheetProps = {
  visible: boolean;
  onClose: () => void;
  transaction?: Transaction;
};

/** "Transaction details" pop-up: reference, status, type, amount, method and time. */
export function TransactionSheet({
  visible,
  onClose,
  transaction: tx,
}: TransactionSheetProps) {
  const theme = useTheme();

  const statusColor = tx
    ? {
        successful: theme.moneyIn,
        pending: theme.badgeSoon,
        failed: theme.moneyOut,
      }[tx.status]
    : theme.moneyIn;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Transaction details"
      footer={
        <Pressable
          accessibilityRole="button"
          // TODO: open support (chat, email or phone) once the app has one.
          onPress={tx?.status === "pending" ? undefined : onClose}
          style={({ pressed }) => [
            styles.close,
            { backgroundColor: theme.brand },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.closeText, { color: theme.onBrand }]}>
            {tx?.status === "pending" ? "Contact support" : "Close"}
          </Text>
        </Pressable>
      }
    >
      {tx && (
        // One child, so the sheet's own section spacing doesn't apply here.
        <View style={styles.content}>
          <View style={styles.head}>
            <Text style={[styles.reference, { color: theme.textSecondary }]}>
              {tx.reference}
            </Text>
            <View
              style={[
                styles.chip,
                {
                  // Pale fills behind the coloured text, as in the design.
                  backgroundColor: {
                    successful: `${statusColor}26`,
                    pending: theme.winRow,
                    failed: theme.moneyOutBg,
                  }[tx.status],
                },
              ]}
            >
              <Text style={[styles.chipText, { color: statusColor }]}>
                {STATUS_LABELS[tx.status]}
              </Text>
            </View>
          </View>

          <Field label="Transaction Type" value={tx.type} />

          <View style={styles.pair}>
            <Field label="Amount" value={formatNaira(Math.abs(tx.amount))} />
            <Field label="Payment Method" value={tx.method} />
          </View>

          <View style={styles.pair}>
            <Field label="Date & Time" value={tx.dateTime} />
            <Field label="Transaction ID" value={tx.reference} />
          </View>
        </View>
      )}
    </BottomSheet>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four - Spacing.one,
  },
  head: {
    gap: Spacing.two + Spacing.one,
    alignItems: "flex-start",
  },
  reference: {
    fontSize: 16,
  },
  chip: {
    height: 24,
    paddingHorizontal: Spacing.two + Spacing.one,
    borderRadius: 12,
    justifyContent: "center",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
  },
  pair: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  field: {
    flex: 1,
    gap: Spacing.one,
  },
  label: {
    fontSize: 12,
  },
  value: {
    fontSize: 15,
  },
  close: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 15,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.85,
  },
});
