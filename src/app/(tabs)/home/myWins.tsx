import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EntryRow } from "@/components/entry-row";
import { type FilterOption } from "@/components/filter-dropdown";
import { FiltersSheet } from "@/components/filters-sheet";
import { ListControls } from "@/components/list-controls";
import { ListHeader } from "@/components/list-header";
import { WinClaimSheet } from "@/components/win-claim-sheet";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { daysAgoRange, type DateFilter } from "@/data/date-filter";
import { DEFAULT_FILTERS, matchesFilters } from "@/data/filters";
import { useTheme } from "@/hooks/use-theme";
import { useWinnings } from "@/hooks/use-winnings";
import { ApiError } from "@/lib/api";
import type { Win } from "@/lib/winnings";

const SIDE = 20;

type StatusFilter = "all" | "active" | "closed";

const STATUS_OPTIONS: FilterOption<StatusFilter>[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];

export default function MyWinsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [date, setDate] = useState<DateFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [claimWin, setClaimWin] = useState<Win>();
  const [claimOpen, setClaimOpen] = useState(false);

  const winnings = useWinnings();
  const loaded = winnings.data;

  const onRefresh = async () => {
    setRefreshing(true);
    await winnings.refetch();
    setRefreshing(false);
  };

  const wins = useMemo(() => {
    const q = query.trim().toLowerCase();
    const [minDays, maxDays] = daysAgoRange(date);
    return (loaded ?? []).filter(
      (w) =>
        w.enteredDaysAgo >= minDays &&
        w.enteredDaysAgo <= maxDays &&
        (status === "all" ||
          w.status === (status === "closed" ? "completed" : status)) &&
        (!q || w.title.toLowerCase().includes(q)) &&
        matchesFilters(w, filters),
    );
  }, [loaded, query, date, status, filters]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ListHeader
        title="My Wins"
        backgroundColor={theme.winsBar}
        image={require("@/assets/images/headers/Voucher 2.png")}
        imageWidth={196}
        imageHeight={81}
      />

      <FlatList
        data={wins}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.brand}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom:
              FloatingTabBarHeight + Math.max(insets.bottom, 12) + Spacing.five,
          },
        ]}
        ListHeaderComponent={
          // Extra space below the pills: each row's star badge hangs above it.
          <View style={styles.controlsGap}>
            <ListControls
              searchPlaceholder="Search entries"
              query={query}
              onQueryChange={setQuery}
              onFilterPress={() => setFiltersOpen(true)}
              date={date}
              onDateChange={setDate}
              status={status}
              statusOptions={STATUS_OPTIONS}
              allStatus="all"
              onStatusChange={setStatus}
            />
          </View>
        }
        ListEmptyComponent={
          winnings.isPending ? (
            <ActivityIndicator
              style={styles.loading}
              size="large"
              color={theme.brand}
            />
          ) : winnings.isError && !loaded ? (
            <View style={styles.errorBox}>
              <Text style={[styles.empty, { color: theme.textSecondary }]}>
                {winnings.error instanceof ApiError
                  ? winnings.error.message
                  : "Couldn't load your wins."}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => winnings.refetch()}
                hitSlop={8}
              >
                <Text style={[styles.retryText, { color: theme.brand }]}>
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : (
            <Text style={[styles.empty, { color: theme.textSecondary }]}>
              {loaded?.length
                ? "No wins match your search."
                : "No wins yet. Your next entry could be the one!"}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <EntryRow
            entry={item}
            onViewDetails={() => {
              setClaimWin(item);
              setClaimOpen(true);
            }}
          />
        )}
      />

      <WinClaimSheet
        visible={claimOpen}
        onClose={() => setClaimOpen(false)}
        win={claimWin}
      />

      <FiltersSheet
        visible={filtersOpen}
        filters={filters}
        onApply={setFilters}
        onClose={() => setFiltersOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SIDE,
    gap: Spacing.two,
  },
  controlsGap: {
    paddingBottom: Spacing.three,
  },
  loading: {
    marginTop: Spacing.six,
  },
  errorBox: {
    alignItems: "center",
    gap: Spacing.three,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  empty: {
    marginTop: Spacing.five,
    textAlign: "center",
    fontSize: 14,
  },
});
