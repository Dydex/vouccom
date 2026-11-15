import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityRow } from "@/components/activity-row";
import { Avatar } from "@/components/avatar";
import { DrawRow } from "@/components/draw-row";
import { EntryDetailsSheet } from "@/components/entry-details-sheet";
import { EntryRow } from "@/components/entry-row";
import { ListingCard } from "@/components/listing-card";
import { NotificationsSheet } from "@/components/notifications-sheet";
import { PurchaseReceiptSheet } from "@/components/purchase-receipt-sheet";
import { SectionBar } from "@/components/section-bar";
import { useToast } from "@/components/toast";
import { TopUpSheet } from "@/components/top-up-sheet";
import { VerifyEmailBanner } from "@/components/verify-email-banner";
import { WinClaimSheet } from "@/components/win-claim-sheet";
import { formatNaira } from "@/constants/currency";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { DRAWS } from "@/data/draws";
import { USER } from "@/data/user";
import type { Entry } from "@/data/entries";
import type { Listing } from "@/data/listings";
import { useEntries } from "@/hooks/use-entries";
import { useListings } from "@/hooks/use-listings";
import { useNotifications } from "@/hooks/use-notifications";
import { usePurchases } from "@/hooks/use-purchases";
import { useTheme } from "@/hooks/use-theme";
import { useWallet } from "@/hooks/use-wallet";
import { useWinnings } from "@/hooks/use-winnings";
import type { ApiPurchase } from "@/lib/api";
import { toActivity } from "@/lib/purchases";
import type { Win } from "@/lib/winnings";
import { useAuth } from "@/state/auth";

const SIDE = 20;

const ACTIVE_SHOWN = 3;
const ACTIVITY_SHOWN = 3;
const BROWSE_COUNT = 8;

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { user, refreshUser } = useAuth();
  // Falls back to sample data until the user has loaded.
  const firstName = user?.profile.firstName ?? USER.firstName;

  const { listings, status, error, refreshing, refresh, retry } = useListings();
  const featured = useMemo(
    () => listings.filter((l) => l.featured),
    [listings],
  );
  // Featured listings already have their own row above.
  const browse = useMemo(
    () => listings.filter((l) => !l.featured).slice(0, BROWSE_COUNT),
    [listings],
  );

  const wallet = useWallet();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const notifications = useNotifications();
  const unreadCount =
    notifications.data?.unreadCount ??
    notifications.data?.notifications.filter((n) => !n.read).length ??
    0;
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const purchases = usePurchases();
  const recentPurchases = (purchases.data ?? []).slice(0, ACTIVITY_SHOWN);
  const [receiptPurchase, setReceiptPurchase] = useState<ApiPurchase>();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const winnings = useWinnings();
  const latestWin = winnings.data?.[0];
  const [claimWin, setClaimWin] = useState<Win>();
  const [claimOpen, setClaimOpen] = useState(false);
  const [detailsEntry, setDetailsEntry] = useState<Entry>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const balance = wallet.data && wallet.data.balanceKobo / 100;
  const entriesQuery = useEntries();
  const activeEntries = useMemo(
    () =>
      (entriesQuery.data ?? [])
        .filter((e) => e.status === "active")
        .slice(0, ACTIVE_SHOWN),
    [entriesQuery.data],
  );

  const onRefresh = async () => {
    const [ok] = await Promise.all([
      refresh(),
      refreshUser(),
      entriesQuery.refetch(),
      wallet.refetch(),
      winnings.refetch(),
      notifications.refetch(),
      purchases.refetch(),
    ]);
    if (!ok) {
      toast.show({
        tone: "error",
        message: "Couldn't refresh the listings. Pull to try again.",
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header band: greeting + balance */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            paddingTop: insets.top + Spacing.three,
          },
        ]}
      >
        <View style={styles.greetingRow}>
          <Avatar size={41} name={firstName} url={user?.profile.avatarUrl} />
          <Text style={[styles.greeting, { color: theme.text }]}>
            Hello {firstName},
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search"
            style={[styles.roundButton, { backgroundColor: theme.greyButton }]}
          >
            <Image
              source={require("@/assets/images/common/Search.png")}
              style={styles.searchIcon}
              contentFit="contain"
              tintColor={theme.search}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
            onPress={() => setNotificationsOpen(true)}
            style={[styles.roundButton, { backgroundColor: theme.greyButton }]}
          >
            <SymbolView
              name={{
                ios: "bell",
                android: "notifications",
                web: "notifications",
              }}
              tintColor={theme.text}
              weight="bold"
              size={18}
            />
            {unreadCount > 0 && (
              <View
                style={[
                  styles.unreadDot,
                  {
                    backgroundColor: theme.coral,
                    borderColor: theme.greyButton,
                  },
                ]}
              />
            )}
          </Pressable>
        </View>

        <View style={[styles.balanceCard, { backgroundColor: theme.brand }]}>
          <View>
            <Text style={[styles.balanceLabel, { color: theme.onBrand }]}>
              Available Balance
            </Text>
            <Text style={[styles.balanceAmount, { color: theme.onBrand }]}>
              {balance === undefined ? "..." : formatNaira(balance)}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add funds"
            onPress={() => setTopUpOpen(true)}
            style={[styles.addButton, { backgroundColor: theme.balanceButton }]}
          >
            <SymbolView
              name={{ ios: "plus", android: "add", web: "add" }}
              tintColor={theme.onBrand}
              size={18}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.brand}
          />
        }
        contentContainerStyle={{
          paddingBottom:
            FloatingTabBarHeight + Math.max(insets.bottom, 12) + Spacing.five,
        }}
      >
        <VerifyEmailBanner />

        {/* Featured: hidden when nothing is featured */}
        {(status !== "ready" || featured.length > 0) && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Featured
            </Text>
            <ListingRow
              listings={featured}
              status={status}
              error={error?.message}
              onRetry={retry}
            />
          </>
        )}

        {/* Browse listings */}
        <SectionBar
          title="Browse Listings"
          barColor={theme.browseBar}
          pillColor={theme.viewAllPill}
          pillTextColor={theme.text}
          onAction={() => router.push("/listings")}
        />
        <ListingRow
          compact
          listings={browse}
          status={status}
          error={error?.message}
          onRetry={retry}
        />

        {/* My active entries */}
        <SectionBar
          title="My active entries"
          barColor={theme.entriesBar}
          pillColor={theme.entriesPill}
          pillTextColor={theme.text}
          onAction={() => router.push("/home/entries")}
        />
        <View style={styles.rowList}>
          {entriesQuery.isPending ? (
            <ActivityIndicator style={styles.rowLoading} color={theme.brand} />
          ) : entriesQuery.isError && !entriesQuery.data ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => entriesQuery.refetch()}
            >
              <Text
                style={[styles.rowStateText, { color: theme.textSecondary }]}
              >
                Couldn't load your entries. Tap to try again.
              </Text>
            </Pressable>
          ) : activeEntries.length === 0 ? (
            <Text style={[styles.rowStateText, { color: theme.textSecondary }]}>
              You have no active entries.
            </Text>
          ) : (
            activeEntries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onViewDetails={() => {
                  setDetailsEntry(entry);
                  setDetailsOpen(true);
                }}
              />
            ))
          )}
        </View>

        {/* My draws */}
        <SectionBar
          title="My draws"
          barColor={theme.drawsBar}
          pillColor={theme.drawsPill}
          pillTextColor={theme.text}
          onAction={() => router.push("/home/myDraws")}
        />
        <View style={styles.rowList}>
          {DRAWS.map((draw) => (
            <DrawRow key={draw.id} draw={draw} />
          ))}
        </View>

        {/* My wins */}
        <SectionBar
          title="My wins"
          barColor={theme.winsBar}
          pillColor={theme.winsPill}
          pillTextColor={theme.onBadge}
          titleColor={theme.onBadge}
          onAction={() => router.push("/home/myWins")}
        />
        <View style={styles.rowList}>
          {winnings.isPending ? (
            <ActivityIndicator style={styles.rowLoading} color={theme.brand} />
          ) : winnings.isError && !winnings.data ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => winnings.refetch()}
            >
              <Text
                style={[styles.rowStateText, { color: theme.textSecondary }]}
              >
                Couldn't load your wins. Tap to try again.
              </Text>
            </Pressable>
          ) : latestWin ? (
            <EntryRow
              entry={latestWin}
              onViewDetails={() => {
                setClaimWin(latestWin);
                setClaimOpen(true);
              }}
            />
          ) : (
            <Text style={[styles.rowStateText, { color: theme.textSecondary }]}>
              No wins yet. Your next entry could be the one!
            </Text>
          )}
        </View>

        {/* Recent activity */}
        <SectionBar
          title="Recent activity"
          barColor={theme.activityBar}
          pillColor={theme.activityPill}
          pillTextColor={theme.text}
          onAction={() => router.push("/home/activity")}
        />
        <View style={styles.rowList}>
          {purchases.isPending ? (
            <ActivityIndicator style={styles.rowLoading} color={theme.brand} />
          ) : purchases.isError && !purchases.data ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => purchases.refetch()}
            >
              <Text
                style={[styles.rowStateText, { color: theme.textSecondary }]}
              >
                Couldn't load your activity. Tap to try again.
              </Text>
            </Pressable>
          ) : recentPurchases.length === 0 ? (
            <Text style={[styles.rowStateText, { color: theme.textSecondary }]}>
              No activity yet.
            </Text>
          ) : (
            recentPurchases.map((purchase) => {
              const activity = toActivity(purchase);
              return (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                  onPress={() => {
                    setReceiptPurchase(purchase);
                    setReceiptOpen(true);
                  }}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      <TopUpSheet visible={topUpOpen} onClose={() => setTopUpOpen(false)} />

      <EntryDetailsSheet
        visible={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        entry={detailsEntry}
      />

      <PurchaseReceiptSheet
        visible={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        purchase={receiptPurchase}
      />

      <NotificationsSheet
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <WinClaimSheet
        visible={claimOpen}
        onClose={() => setClaimOpen(false)}
        win={claimWin}
      />
    </View>
  );
}

/** A horizontal row of listing cards, or its loading, error or empty state. */
function ListingRow({
  listings,
  status,
  error,
  onRetry,
  compact,
}: {
  listings: Listing[];
  status: "loading" | "ready" | "error";
  error?: string;
  onRetry: () => void;
  compact?: boolean;
}) {
  const theme = useTheme();

  if (status === "loading") {
    return (
      <View style={styles.rowState}>
        <ActivityIndicator color={theme.brand} />
      </View>
    );
  }

  if (status === "error" || listings.length === 0) {
    return (
      <View style={styles.rowState}>
        <Text style={[styles.rowStateText, { color: theme.textSecondary }]}>
          {status === "error"
            ? (error ?? "Couldn't load the listings.")
            : "No listings yet."}
        </Text>
        {status === "error" && (
          <Pressable accessibilityRole="button" onPress={onRetry} hitSlop={8}>
            <Text style={[styles.retryText, { color: theme.brand }]}>
              Try again
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={listings}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rowContent}
      renderItem={({ item }) => (
        <ListingCard listing={item} compact={compact} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  header: {
    // Pinned above the scroll view; sits over the content with a soft glow.
    zIndex: 1,
    shadowColor: "#2855FF",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    paddingHorizontal: SIDE,
    paddingBottom: 12,
    gap: Spacing.three,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  greeting: {
    flex: 1,
    marginLeft: Spacing.one,
    fontSize: 15,
    fontWeight: "500",
  },
  roundButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  searchIcon: {
    width: 18,
    height: 18,
  },
  balanceCard: {
    height: 56,
    borderRadius: 28,
    paddingLeft: Spacing.four - Spacing.one,
    paddingRight: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balanceLabel: {
    fontSize: 10,
    opacity: 0.7,
  },
  balanceAmount: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "600",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    marginTop: Spacing.three,
    marginBottom: Spacing.two + Spacing.one,
    paddingHorizontal: SIDE,
    fontSize: 15,
    fontWeight: "500",
  },
  rowContent: {
    paddingHorizontal: SIDE,
    gap: Spacing.three,
  },
  rowState: {
    minHeight: 120,
    marginHorizontal: SIDE,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  rowLoading: {
    marginVertical: Spacing.three,
  },
  rowStateText: {
    fontSize: 13,
    textAlign: "center",
  },
  retryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  rowList: {
    marginHorizontal: SIDE,
    gap: Spacing.two,
  },
});
