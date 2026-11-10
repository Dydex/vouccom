import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityRow } from "@/components/activity-row";
import { DrawRow } from "@/components/draw-row";
import { EntryRow } from "@/components/entry-row";
import { ListingCard } from "@/components/listing-card";
import { SectionBar } from "@/components/section-bar";
import { formatNaira } from "@/constants/currency";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { ACTIVITY, DRAWS } from "@/data/draws";
import { ENTRIES, WINS } from "@/data/entries";
import { WALLET_BALANCE } from "@/data/wallet";
import { BROWSE_LISTINGS, FEATURED_LISTINGS } from "@/data/listings";
import { useTheme } from "@/hooks/use-theme";

// TODO: read the signed-in user's name from the backend.
const USER_NAME = "Kola";

const SIDE = 20;

const ACTIVE_ENTRIES = ENTRIES.filter((e) => e.status === "active").slice(0, 3);

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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
          <View style={[styles.avatar, { backgroundColor: theme.coral }]}>
            <Text style={styles.avatarText}>{USER_NAME[0]}</Text>
          </View>
          <Text style={[styles.greeting, { color: theme.text }]}>
            Hello {USER_NAME},
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
            accessibilityLabel="Notifications"
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
          </Pressable>
        </View>

        <View style={[styles.balanceCard, { backgroundColor: theme.brand }]}>
          <View>
            <Text style={[styles.balanceLabel, { color: theme.onBrand }]}>
              Available Balance
            </Text>
            <Text style={[styles.balanceAmount, { color: theme.onBrand }]}>
              {formatNaira(WALLET_BALANCE)}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add funds"
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
        contentContainerStyle={{
          paddingBottom:
            FloatingTabBarHeight + Math.max(insets.bottom, 12) + Spacing.five,
        }}
      >
        {/* Featured */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Featured
        </Text>
        <FlatList
          horizontal
          data={FEATURED_LISTINGS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowContent}
          renderItem={({ item }) => <ListingCard listing={item} />}
        />

        {/* Browse listings */}
        <SectionBar
          title="Browse Listings"
          barColor={theme.browseBar}
          pillColor={theme.viewAllPill}
          pillTextColor={theme.text}
          onAction={() => router.push("/listings")}
        />
        <FlatList
          horizontal
          data={BROWSE_LISTINGS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowContent}
          renderItem={({ item }) => <ListingCard listing={item} compact />}
        />

        {/* My active entries */}
        <SectionBar
          title="My active entries"
          barColor={theme.entriesBar}
          pillColor={theme.entriesPill}
          pillTextColor={theme.text}
          onAction={() => router.push("/entries")}
        />
        <View style={styles.rowList}>
          {ACTIVE_ENTRIES.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </View>

        {/* My draws */}
        <SectionBar
          title="My draws"
          barColor={theme.drawsBar}
          pillColor={theme.drawsPill}
          pillTextColor={theme.text}
          onAction={() => router.push("/myDraws")}
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
          onAction={() => router.push("/myWins")}
        />
        <View style={styles.rowList}>
          {WINS.slice(0, 1).map((win) => (
            <EntryRow key={win.id} entry={win} />
          ))}
        </View>

        {/* Recent activity */}
        <SectionBar
          title="Recent activity"
          barColor={theme.activityBar}
          pillColor={theme.activityPill}
          pillTextColor={theme.text}
          onAction={() => router.push("/activity")}
        />
        <View style={styles.rowList}>
          {ACTIVITY.slice(0, 3).map((activity) => (
            <ActivityRow key={activity.id} activity={activity} />
          ))}
        </View>
      </ScrollView>
    </View>
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
  avatar: {
    width: 41,
    height: 41,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1F20",
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
  rowList: {
    marginHorizontal: SIDE,
    gap: Spacing.two,
  },
});
