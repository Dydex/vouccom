import { SymbolView, type SymbolViewProps } from "expo-symbols";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";

import { BottomSheet } from "@/components/bottom-sheet";
import { QuantityBar } from "@/components/quantity-bar";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { ListingDocument, ListingDocumentType } from "@/lib/api";

type Kind = "doc" | "video" | "gallery";

// Every tile in the design: one per document type, plus the photo gallery.
const ITEMS: {
  id: ListingDocumentType | "gallery";
  label: string;
  kind: Kind;
}[] = [
  { id: "inspection_report", label: "Inspection Report", kind: "doc" },
  {
    id: "service_history",
    label: "Service & Maintenance history",
    kind: "doc",
  },
  { id: "ownership_history", label: "Ownership history", kind: "doc" },
  { id: "accident_records", label: "Accident & damage records", kind: "doc" },
  { id: "import_documentation", label: "Import Documentation", kind: "doc" },
  { id: "walkthrough_video", label: "Walkthrough video", kind: "video" },
  {
    id: "engine_chassis_report",
    label: "Engine and chassis report",
    kind: "doc",
  },
  {
    id: "authenticity_certificate",
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
  /** The listing's documents; tiles without one show as not available. */
  documents?: ListingDocument[];
  /** How many photos the listing has, for the gallery tile. */
  imageCount: number;
  /** Shows the photos (the gallery at the top of the listing). */
  onViewGallery: () => void;
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
  documents = [],
  imageCount,
  onViewGallery,
}: AdditionalInfoSheetProps) {
  const theme = useTheme();

  const tint: Record<Kind, string> = {
    doc: theme.brand,
    video: theme.coral,
    gallery: theme.accent,
  };

  /** What a tile does when tapped, or undefined if the listing doesn't have it. */
  const actionFor = (id: (typeof ITEMS)[number]["id"]) => {
    if (id === "gallery") return imageCount > 0 ? onViewGallery : undefined;
    const doc = documents.find((d) => d.type === id);
    return doc
      ? () => {
          WebBrowser.openBrowserAsync(doc.url).catch(() => {});
        }
      : undefined;
  };

  // Only the tiles the listing has something for.
  const available = ITEMS.flatMap((item) => {
    const action = actionFor(item.id);
    return action ? [{ item, action }] : [];
  });

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Additional Information"
      // Fits the tiles: grows with how many the listing has, then scrolls.
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
      {available.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textSecondary }]}>
          No additional information has been added for this listing yet.
        </Text>
      ) : (
        <View style={styles.grid}>
          {available.map(({ item, action }) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={action}
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
      )}
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
  empty: {
    marginVertical: Spacing.four,
    fontSize: 14,
    textAlign: "center",
  },
  glow: {
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
