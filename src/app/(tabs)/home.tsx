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

import { FLOATING_TAB_BAR_HEIGHT } from "@/components/floating-tabs";
import { ListingCard } from "@/components/listing-card";
import { formatNaira } from "@/constants/currency";
import { Spacing } from "@/constants/theme";
import { BROWSE_LISTINGS, FEATURED_LISTINGS } from "@/data/listings";
import { useTheme } from "@/hooks/use-theme";

// TODO: read the signed-in user's name and wallet balance from the backend.
const USER_NAME = "Kola";
const BALANCE = 125000;

const SIDE = 20;

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom:
            FLOATING_TAB_BAR_HEIGHT +
            Math.max(insets.bottom, 12) +
            Spacing.five,
        }}
      >
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
              style={[
                styles.roundButton,
                { backgroundColor: theme.greyButton },
              ]}
            >
              <SymbolView
                name={{
                  ios: "magnifyingglass",
                  android: "search",
                  web: "search",
                }}
                tintColor={theme.search}
                size={18}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={[
                styles.roundButton,
                { backgroundColor: theme.greyButton },
              ]}
            >
              <SymbolView
                name={{
                  ios: "bell",
                  android: "notifications",
                  web: "notifications",
                }}
                tintColor={theme.text}
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
                {formatNaira(BALANCE)}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add funds"
              style={[
                styles.addButton,
                { backgroundColor: theme.balanceButton },
              ]}
            >
              <SymbolView
                name={{ ios: "plus", android: "add", web: "add" }}
                tintColor={theme.onBrand}
                size={18}
              />
            </Pressable>
          </View>
        </View>

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
        <View style={[styles.browseBar, { backgroundColor: theme.browseBar }]}>
          <Text style={[styles.browseTitle, { color: theme.text }]}>
            Browse Listings
          </Text>
          <Pressable
            accessibilityRole="button"
            style={[styles.viewAll, { backgroundColor: theme.viewAllPill }]}
          >
            <Text style={[styles.viewAllText, { color: theme.viewAllText }]}>
              view all
            </Text>
          </Pressable>
        </View>
        <FlatList
          horizontal
          data={BROWSE_LISTINGS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowContent}
          renderItem={({ item }) => <ListingCard listing={item} compact />}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  },
  roundButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
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
  browseBar: {
    marginTop: Spacing.four,
    marginBottom: Spacing.three,
    marginHorizontal: SIDE,
    height: 56,
    borderRadius: 20,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  browseTitle: {
    fontSize: 14,
  },
  viewAll: {
    height: 38,
    paddingHorizontal: Spacing.four - Spacing.one,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  viewAllText: {
    fontSize: 13,
  },
});
