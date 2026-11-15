import { router } from "expo-router";
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

import { DrawRow } from "@/components/draw-row";
import { EntryDetailsSheet } from "@/components/entry-details-sheet";
import { type FilterOption } from "@/components/filter-dropdown";
import { FiltersSheet } from "@/components/filters-sheet";
import { ListControls } from "@/components/list-controls";
import { ListHeader } from "@/components/list-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { daysAgoRange, type DateFilter } from "@/data/date-filter";
import type { Draw } from "@/data/draws";
import type { Entry } from "@/data/entries";
import { DEFAULT_FILTERS, matchesFilters } from "@/data/filters";
import { useMyDraws } from "@/hooks/use-draws";
import { useEntries } from "@/hooks/use-entries";
import { useTheme } from "@/hooks/use-theme";
import { ApiError } from "@/lib/api";

const SIDE = 20;

type StatusFilter = "all" | "live" | "upcoming";

const STATUS_OPTIONS: FilterOption<StatusFilter>[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
];

export default function MyDrawsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [date, setDate] = useState<DateFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [detailsEntry, setDetailsEntry] = useState<Entry>();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const myDraws = useMyDraws();
  const entries = useEntries();
  const loaded = myDraws.data;

  const onRefresh = async () => {
    setRefreshing(true);
    await myDraws.refetch();
    setRefreshing(false);
  };

  // A draw's id is its listing's id, the same as the entry's.
  const viewDetails = (draw: Draw) => {
    const entry = entries.data?.find((e) => e.id === draw.id);
    if (!entry) return;
    setDetailsEntry(entry);
    setDetailsOpen(true);
  };

  const draws = useMemo(() => {
    const q = query.trim().toLowerCase();
    const [minDays, maxDays] = daysAgoRange(date);
    return (loaded ?? []).filter(
      (d) =>
        d.enteredDaysAgo >= minDays &&
        d.enteredDaysAgo <= maxDays &&
        (status === "all" || (status === "live") === !!d.live) &&
        (!q || d.title.toLowerCase().includes(q)) &&
        matchesFilters(d, filters),
    );
  }, [loaded, query, date, status, filters]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ListHeader
        title="My Draws"
        backgroundColor={theme.coral}
        image={require("@/assets/images/headers/Die@4x 1.png")}
        imageWidth={215}
        imageHeight={131}
      />

      <FlatList
        data={draws}
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
          <ListControls
            searchPlaceholder="Search draws"
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
        }
        ListEmptyComponent={
          myDraws.isPending ? (
            <ActivityIndicator
              style={styles.loading}
              size="large"
              color={theme.brand}
            />
          ) : myDraws.isError && !loaded ? (
            <View style={styles.errorBox}>
              <Text style={[styles.empty, { color: theme.textSecondary }]}>
                {myDraws.error instanceof ApiError
                  ? myDraws.error.message
                  : "Couldn't load your draws."}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => myDraws.refetch()}
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
                ? "No draws match your search."
                : "You're not in any upcoming draws."}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <DrawRow
            draw={item}
            onViewDetails={viewDetails}
            onWatch={(draw) =>
              router.push({
                pathname: "/listing/[id]",
                params: { id: draw.id },
              })
            }
          />
        )}
      />

      <EntryDetailsSheet
        visible={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        entry={detailsEntry}
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
    gap: Spacing.two + Spacing.half,
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
