import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";

import { formatNaira } from "@/constants/currency";
import { Spacing } from "@/constants/theme";
import type { Listing } from "@/data/listings";
import { useTheme } from "@/hooks/use-theme";

type ListingCardProps = {
  listing: Listing;
  /** Narrower card used in the "Browse Listings" row. */
  compact?: boolean;
  /** Fill the available width (grid cells) instead of the fixed card width. */
  fluid?: boolean;
  onBuy?: (listing: Listing) => void;
};

export function ListingCard({
  listing,
  compact,
  fluid,
  onBuy,
}: ListingCardProps) {
  const theme = useTheme();
  const [saved, setSaved] = useState(false);

  const badgeColor = listing.badge === "new" ? theme.badgeNew : theme.badgeSoon;

  const openDetails = () =>
    router.push({ pathname: "/listing/[id]", params: { id: listing.id } });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${listing.title}`}
      onPress={openDetails}
      style={[
        styles.card,
        {
          width: fluid ? undefined : compact ? 169 : 260,
          backgroundColor: theme.card,
        },
        fluid && styles.fluid,
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
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {listing.title}
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.textSecondary }]}
          numberOfLines={compact ? 2 : 1}
        >
          {formatNaira(listing.voucherPrice)} per voucher
          {/* Only the narrow Browse card puts the draw date on its own line. */}
          {compact ? "\n" : " · "}Draw: {listing.drawDate}
        </Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => (onBuy ? onBuy(listing) : openDetails())}
            style={({ pressed }) => [
              styles.buy,
              compact ? styles.buyCompact : styles.buyWide,
              { backgroundColor: theme.brand },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.buyText, { color: theme.onBrand }]}>
              {compact ? "Buy" : "Buy voucher"}
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
  },
  fluid: {
    flex: 1,
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
    width: 68,
  },
  buyText: {
    fontSize: 13,
    fontWeight: "600",
  },
  save: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
});
