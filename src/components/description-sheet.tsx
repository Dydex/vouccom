import { StyleSheet, View } from "react-native";
import { Text } from "@/components/text";

import { BottomSheet } from "@/components/bottom-sheet";
import { QuantityBar } from "@/components/quantity-bar";
import { Spacing } from "@/constants/theme";
import type { ListingInfo } from "@/data/listings";
import { useTheme } from "@/hooks/use-theme";

type DescriptionSheetProps = {
  visible: boolean;
  onClose: () => void;
  info: ListingInfo;
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  unitPrice: number;
  onAdd: () => void;
};

/** "Description" pop-up: asset overview, what's included and condition summary. */
export function DescriptionSheet({
  visible,
  onClose,
  info,
  quantity,
  maxQuantity,
  onQuantityChange,
  unitPrice,
  onAdd,
}: DescriptionSheetProps) {
  const theme = useTheme();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Description"
      tall
      footer={
        <QuantityBar
          quantity={quantity}
          maxQuantity={maxQuantity}
          onQuantityChange={onQuantityChange}
          unitPrice={unitPrice}
          onAdd={onAdd}
        />
      }
    >
      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>
          Asset Overview
        </Text>
        {info.overview.map((paragraph, i) => (
          <Text key={i} style={[styles.body, { color: theme.text }]}>
            {paragraph}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>
          What's Included
        </Text>
        <View style={styles.list}>
          {info.included.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Text style={[styles.body, { color: theme.text }]}>·</Text>
              <Text style={[styles.body, { color: theme.text }]}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>
          Condition Summary
        </Text>
        <View style={styles.list}>
          {info.condition.map((row) => (
            <View key={row.label} style={styles.conditionRow}>
              <Text
                style={[
                  styles.body,
                  styles.conditionLabel,
                  { color: theme.textSecondary },
                ]}
              >
                {row.label}
              </Text>
              <Text
                style={[
                  styles.body,
                  styles.conditionValue,
                  { color: theme.text },
                ]}
              >
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {info.details.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.text }]}>
            Vehicle Details
          </Text>
          <View>
            {info.details.map((row) => (
              <View
                key={row.label}
                style={[
                  styles.detailRow,
                  { borderBottomColor: theme.greyButton },
                ]}
              >
                <Text
                  style={[
                    styles.body,
                    styles.detailLabel,
                    { color: theme.text },
                  ]}
                >
                  {row.label}
                </Text>
                <Text
                  style={[
                    styles.body,
                    styles.detailValue,
                    { color: theme.text },
                  ]}
                >
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three,
  },
  heading: {
    fontSize: 15,
    fontWeight: "500",
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  list: {
    gap: Spacing.one,
  },
  bulletRow: {
    flexDirection: "row",
    gap: Spacing.two,
    paddingLeft: Spacing.two,
  },
  conditionRow: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  conditionLabel: {
    width: 96,
  },
  conditionValue: {
    flex: 1,
  },
  detailRow: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  detailLabel: {
    width: 140,
  },
  detailValue: {
    flex: 1,
  },
});
