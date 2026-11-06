import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatNaira } from "@/constants/currency";
import { Spacing } from "@/constants/theme";
import type { Listing } from "@/data/listings";
import { useTheme } from "@/hooks/use-theme";

type ListingCardProps = {
  listing: Listing;
  /** Narrower card used in the "Browse Listings" row. */
  compact?: boolean;
  onBuy?: (listing: Listing) => void;
};

export function ListingCard({ listing, compact, onBuy }: ListingCardProps) {
  const theme = useTheme();
  const [saved, setSaved] = useState(false);

  const badgeColor =
    listing.badge === "new" ? theme.badgeNew : theme.badgeSoon;

  return (
    <View
      style={[
        styles.card,
        { width: compact ? 169 : 260, backgroundColor: theme.greyButton },
      ]}
    >
      <View style={[styles.media, { backgroundColor: theme.cardMedia }]}>
        <Image
          source={listing.image}
          style={styles.image}
          contentFit="contain"
        />
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={[styles.badgeText, { color: theme.onBadge }]}>
            {listing.badgeLabel}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text
          style={[styles.title, { color: theme.text }]}
          numberOfLines={1}
        >
          {listing.title}
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {formatNaira(listing.voucherPrice)} per voucher · Draw:{" "}
          {listing.drawDate}
        </Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onBuy?.(listing)}
            style={({ pressed }) => [
              styles.buy,
              compact ? styles.buyCompact : styles.buyWide,
              { backgroundColor: theme.brand },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.buyText, { color: theme.onBrand }]}>
              Buy voucher
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saved ? "Remove from saved" : "Save listing"}
            accessibilityState={{ selected: saved }}
            onPress={() => setSaved((v) => !v)}
            style={[styles.save, { backgroundColor: theme.chip }]}
          >
            <SymbolView
              name={{
                ios: saved ? "bookmark.fill" : "bookmark",
                android: "bookmark",
                web: "bookmark",
              }}
              tintColor={saved ? theme.brand : theme.text}
              size={16}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
  },
  media: {
    height: 134,
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  body: {
    padding: 14,
    gap: 4,
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 16,
  },
  actions: {
    marginTop: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  buy: {
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  buyWide: {
    width: 127,
  },
  buyCompact: {
    flex: 1,
  },
  buyText: {
    fontSize: 13,
    fontWeight: "600",
  },
  save: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
});
