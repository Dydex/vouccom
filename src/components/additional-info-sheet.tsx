import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";

import { BottomSheet } from "@/components/bottom-sheet";
import { QuantityBar } from "@/components/quantity-bar";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Kind = "doc" | "video" | "gallery";

// TODO: the backend should say which of these exist for each listing.
const ITEMS: { id: string; label: string; kind: Kind }[] = [
  { id: "inspection", label: "Inspection Report", kind: "doc" },
  { id: "service", label: "Service & Maintenance history", kind: "doc" },
  { id: "ownership", label: "Ownership history", kind: "doc" },
  { id: "accident", label: "Accident & damage records", kind: "doc" },
  { id: "import", label: "Import Documentation", kind: "doc" },
  { id: "walkthrough", label: "Walkthrough video", kind: "video" },
  { id: "engine", label: "Engine and chassis report", kind: "doc" },
  {
    id: "authenticity",
    label: "Vehicle authenticity certificate",
    kind: "doc",
  },
  { id: "gallery", label: "HD interior and Exterior gallery", kind: "gallery" },
];

const ICONS: Record<Kind, SymbolViewProps["name"]> = {
  doc: { ios: "doc.text.fill", android: "description", web: "description" },
  video: { ios: "play.circle", android: "play_circle", web: "play_circle" },
  gallery: { ios: "photo", android: "image", web: "image" },
};

type AdditionalInfoSheetProps = {
  visible: boolean;
  onClose: () => void;
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  unitPrice: number;
  onAdd: () => void;
};

/** "Additional Information" pop-up: a grid of documents and media about the asset. */
export function AdditionalInfoSheet({
  visible,
  onClose,
  quantity,
  maxQuantity,
  onQuantityChange,
  unitPrice,
  onAdd,
}: AdditionalInfoSheetProps) {
  const theme = useTheme();

  const tint: Record<Kind, string> = {
    doc: theme.brand,
    video: theme.coral,
    gallery: theme.accent,
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Additional Information"
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
      <View style={styles.grid}>
        {ITEMS.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            // TODO: open the document, video or gallery once those exist.
            style={({ pressed, hovered }) => [
              styles.card,
              { backgroundColor: theme.card },
              // Blue glow while pressed (or hovered, on the web), like the design.
              (pressed || hovered) && [
                styles.glow,
                { backgroundColor: theme.menu, shadowColor: theme.brand },
              ],
            ]}
          >
            <SymbolView
              name={ICONS[item.kind]}
              tintColor={tint[item.kind]}
              size={28}
            />
            <Text style={[styles.label, { color: theme.text }]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.three,
  },
  card: {
    width: "48%",
    minHeight: 136,
    borderRadius: 20,
    padding: Spacing.three,
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
  },
  glow: {
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
