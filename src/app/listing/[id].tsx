import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CheckoutSheet } from "@/components/checkout-sheet";
import { AdditionalInfoSheet } from "@/components/additional-info-sheet";
import { CommentsSheet } from "@/components/comments-sheet";
import { DescriptionSheet } from "@/components/description-sheet";
import { DrawDetailsSheet } from "@/components/draw-details-sheet";
import { QuantityBar } from "@/components/quantity-bar";
import { formatNaira } from "@/constants/currency";
import { Spacing } from "@/constants/theme";
import {
  drawLinkUrl,
  drawStatus,
  findListing,
  formatDrawDateTime,
  listingDescription,
  listingInfo,
  type Listing,
} from "@/data/listings";
import { useTheme } from "@/hooks/use-theme";

const SIDE = 20;
const MAX_QUANTITY = 100;
type Sheet = "description" | "info" | "comments" | "draw" | "checkout";

const TABS: { label: string; sheet?: Sheet }[] = [
  { label: "Description", sheet: "description" },
  { label: "Additional Info", sheet: "info" },
  { label: "Comments", sheet: "comments" },
  { label: "Draw Details", sheet: "draw" },
];

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace("/listings");
}

export default function ListingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listing = findListing(id);

  if (!listing) return <NotFound />;
  return <ListingDetails listing={listing} />;
}

function NotFound() {
  const theme = useTheme();

  return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <Text style={[styles.notFound, { color: theme.textSecondary }]}>
        This listing is no longer available.
      </Text>
      <Pressable accessibilityRole="button" onPress={goBack} hitSlop={12}>
        <Text style={{ color: theme.brand, fontSize: 14 }}>Go back</Text>
      </Pressable>
    </View>
  );
}

function ListingDetails({ listing }: { listing: Listing }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [page, setPage] = useState(0);
  // Only one pop-up is open at a time.
  const [sheet, setSheet] = useState<Sheet | null>(null);

  const images = listing.images ?? [listing.image];
  const heroHeight = Math.round(width * 0.88);
  const title = listing.detailTitle ?? listing.title;
  // "Foreign Used 2026 Honda Civic" -> "Foreign Used" / "2026 Honda Civic"
  const [condition, ...rest] = title.split(/\s(?=20\d\d\s)/);
  const closes = listing.drawDate.split(",")[0];
  const badgeColor = listing.badge === "new" ? theme.badgeNew : theme.badgeSoon;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* The gallery band is light in both themes, so keep dark status-bar icons. */}
      <StatusBar style="dark" />

      {/* Gallery: stays put while the details below scroll */}
      <View
        style={{
          height: heroHeight,
          backgroundColor: theme.cardMedia,
        }}
      >
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          onMomentumScrollEnd={(e) =>
            setPage(Math.round(e.nativeEvent.contentOffset.x / width))
          }
          renderItem={({ item }) => (
            <Image
              source={item}
              style={{ width, height: heroHeight }}
              contentFit="contain"
            />
          )}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={goBack}
          style={[
            styles.roundButton,
            {
              top: insets.top + Spacing.two,
              left: SIDE,
              backgroundColor: theme.card,
            },
          ]}
        >
          <Image
            source={require("@/assets/images/common/backarrow.png")}
            style={styles.backArrow}
            contentFit="contain"
            tintColor="#1E1F20"
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View photos full screen"
          hitSlop={12}
          // TODO: open a full-screen gallery.
          style={[
            styles.expand,
            { top: insets.top + Spacing.three, right: SIDE },
          ]}
        >
          <SymbolView
            name={{
              ios: "arrow.up.left.and.arrow.down.right",
              android: "open_in_full",
              web: "open_in_full",
            }}
            tintColor="#FFFFFF"
            size={18}
          />
        </Pressable>

        {images.length > 1 && (
          <View style={styles.dashes}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dash,
                  { backgroundColor: i === page ? "#FFFFFF" : "#E8E9EC" },
                ]}
              />
            ))}
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: theme.textSecondary }]}>
            {formatNaira(listing.voucherPrice)} per voucher · Closes: {closes}.
          </Text>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={[styles.badgeText, { color: theme.onBadge }]}>
              {listing.badgeLabel}
            </Text>
          </View>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>
          {rest.length ? `${condition}\n${rest.join(" ")}` : title}
        </Text>

        <Text style={[styles.description, { color: theme.text }]}>
          {listingDescription(listing)}
        </Text>

        <View style={styles.iconRow}>
          <View style={styles.iconGroup}>
            <IconCircle
              label="Verified"
              color={theme.accent}
              tint="#1FBF74"
              name={{
                ios: "checkmark.circle",
                android: "check_circle",
                web: "check_circle",
              }}
            />
            <IconCircle
              label="Featured"
              color={theme.brand}
              tint="#FFFFFF"
              name={{ ios: "star", android: "star", web: "star" }}
            />
            <IconCircle
              label="Secure"
              color={theme.winsBar}
              tint="#FFF3B0"
              name={{ ios: "lock", android: "lock", web: "lock" }}
            />
            <IconCircle
              label="Car"
              color={theme.iconPink}
              tint="#FFD6DA"
              name={{
                ios: "car",
                android: "directions_car",
                web: "directions_car",
              }}
            />
          </View>

          <View style={styles.iconGroup}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={saved ? "Remove from saved" : "Save listing"}
              accessibilityState={{ selected: saved }}
              onPress={() => setSaved((v) => !v)}
              style={[
                styles.iconCircle,
                {
                  backgroundColor: saved
                    ? theme.textSecondary
                    : theme.greyButton,
                },
              ]}
            >
              <SymbolView
                name={{
                  ios: saved ? "bookmark.fill" : "bookmark",
                  android: "bookmark",
                  web: "bookmark",
                }}
                tintColor={saved ? "#FFFFFF" : theme.text}
                size={16}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share listing"
              onPress={() =>
                Share.share({ message: `${title} on VOUCCOM` }).catch(() => {})
              }
              style={[styles.iconCircle, { backgroundColor: theme.greyButton }]}
            >
              <SymbolView
                name={{ ios: "paperplane", android: "send", web: "send" }}
                tintColor={theme.text}
                size={16}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {TABS.map((tab) => (
            <Pressable
              key={tab.label}
              accessibilityRole="button"
              onPress={() => tab.sheet && setSheet(tab.sheet)}
              style={[styles.tab, { backgroundColor: theme.card }]}
            >
              <Text style={[styles.tabText, { color: theme.text }]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={[styles.divider, { backgroundColor: theme.greyButton }]} />

        <View style={styles.entries}>
          <Text style={[styles.meta, { color: theme.textSecondary }]}>
            Your entries
          </Text>
          {listing.userEntries ? (
            <View style={[styles.entryCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.entryTitle, { color: theme.text }]}>
                {listing.userEntries.count}{" "}
                {listing.userEntries.count === 1 ? "Entry" : "Entries"}
              </Text>
              <View style={styles.entryMeta}>
                <Text
                  style={[styles.entryMetaText, { color: theme.textSecondary }]}
                >
                  {listing.userEntries.daysAgo}{" "}
                  {listing.userEntries.daysAgo === 1 ? "day" : "days"} ago
                </Text>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  // TODO: open the entry details once that screen exists.
                >
                  <Text
                    style={[
                      styles.entryMetaText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    View details
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={[styles.entryCard, { backgroundColor: theme.card }]}>
              <Text
                style={[styles.entryMetaText, { color: theme.textSecondary }]}
              >
                You haven't entered this draw yet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Quantity + add to cart */}
      <View
        style={[
          styles.bar,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.greyButton,
            paddingBottom: Math.max(insets.bottom, 12) + Spacing.one,
          },
        ]}
      >
        <QuantityBar
          quantity={quantity}
          maxQuantity={MAX_QUANTITY}
          onQuantityChange={setQuantity}
          unitPrice={listing.voucherPrice}
          onAdd={() => setSheet("checkout")}
        />
      </View>

      <DescriptionSheet
        visible={sheet === "description"}
        onClose={() => setSheet(null)}
        info={listingInfo(listing)}
        quantity={quantity}
        maxQuantity={MAX_QUANTITY}
        onQuantityChange={setQuantity}
        unitPrice={listing.voucherPrice}
        onAdd={() => setSheet("checkout")}
      />

      <AdditionalInfoSheet
        visible={sheet === "info"}
        onClose={() => setSheet(null)}
        quantity={quantity}
        maxQuantity={MAX_QUANTITY}
        onQuantityChange={setQuantity}
        unitPrice={listing.voucherPrice}
        onAdd={() => setSheet("checkout")}
      />

      <CommentsSheet
        visible={sheet === "comments"}
        onClose={() => setSheet(null)}
        quantity={quantity}
        maxQuantity={MAX_QUANTITY}
        onQuantityChange={setQuantity}
        unitPrice={listing.voucherPrice}
        onAdd={() => setSheet("checkout")}
      />

      <DrawDetailsSheet
        visible={sheet === "draw"}
        onClose={() => setSheet(null)}
        status={drawStatus(listing)}
        dateTime={formatDrawDateTime(listing.drawDate)}
        link={{ label: "YouTube", url: drawLinkUrl(listing) }}
        // TODO: add the draw to the phone's calendar (needs expo-calendar).
        actionLabel="Add to calendar"
      />

      <CheckoutSheet
        visible={sheet === "checkout"}
        onClose={() => setSheet(null)}
        itemName={`${rest.length ? rest.join(" ") : title} voucher`}
        unitPrice={listing.voucherPrice}
        quantity={quantity}
        maxQuantity={MAX_QUANTITY}
        onQuantityChange={setQuantity}
        onRemove={() => {
          setSheet(null);
          setQuantity(1);
        }}
      />
    </View>
  );
}

function IconCircle({
  label,
  color,
  tint,
  name,
}: {
  label: string;
  color: string;
  tint: string;
  name: SymbolViewProps["name"];
}) {
  return (
    <View
      accessibilityLabel={label}
      style={[styles.iconCircle, { backgroundColor: color }]}
    >
      <SymbolView name={name} tintColor={tint} size={18} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
  notFound: {
    fontSize: 14,
  },
  roundButton: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    width: 18,
    height: 14,
  },
  expand: {
    position: "absolute",
  },
  dashes: {
    position: "absolute",
    bottom: Spacing.three,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.two,
  },
  dash: {
    width: 32,
    height: 3,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: SIDE,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  meta: {
    flexShrink: 1,
    fontSize: 12,
  },
  badge: {
    height: 24,
    paddingHorizontal: Spacing.three - Spacing.one,
    borderRadius: 12,
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "500",
    marginTop: Spacing.one,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconGroup: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  tabs: {
    gap: Spacing.two,
  },
  tab: {
    height: 38,
    paddingHorizontal: Spacing.three,
    borderRadius: 19,
    justifyContent: "center",
  },
  tabText: {
    fontSize: 13,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  entries: {
    gap: Spacing.two,
  },
  entryCard: {
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    gap: Spacing.half,
  },
  entryTitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  entryMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  entryMetaText: {
    fontSize: 10,
  },
  bar: {
    paddingTop: Spacing.three,
    paddingHorizontal: SIDE,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
