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

import { EntryDetailsSheet } from "@/components/entry-details-sheet";
import { EntryRow } from "@/components/entry-row";
import { type FilterOption } from "@/components/filter-dropdown";
import { FiltersSheet } from "@/components/filters-sheet";
import { ListControls } from "@/components/list-controls";
import { ListHeader } from "@/components/list-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { daysAgoRange, type DateFilter } from "@/data/date-filter";
import type { Entry } from "@/data/entries";
import { DEFAULT_FILTERS, matchesFilters } from "@/data/filters";
import { useEntries } from "@/hooks/use-entries";
import { useTheme } from "@/hooks/use-theme";
import { ApiError } from "@/lib/api";

const SIDE = 20;

type StatusFilter = "all" | "active" | "closed";

const STATUS_OPTIONS: FilterOption<StatusFilter>[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];

export default function EntriesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [date, setDate] = useState<DateFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailsEntry, setDetailsEntry] = useState<Entry>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const entriesQuery = useEntries();
  const loaded = entriesQuery.data;

  const onRefresh = async () => {
    setRefreshing(true);
    await entriesQuery.refetch();
    setRefreshing(false);
  };

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const [minDays, maxDays] = daysAgoRange(date);
    return (loaded ?? []).filter(
      (e) =>
        e.enteredDaysAgo >= minDays &&
        e.enteredDaysAgo <= maxDays &&
        (status === "all" ||
          e.status === (status === "closed" ? "completed" : status)) &&
        (!q || e.title.toLowerCase().includes(q)) &&
        matchesFilters(e, filters),
    );
  }, [loaded, query, date, status, filters]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ListHeader
        title="My Entries"
        backgroundColor={theme.accent}
        image={require("@/assets/images/headers/Voucher 1.png")}
        imageWidth={196}
        imageHeight={81}
      />

      <FlatList
        data={entries}
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
        }
        ListEmptyComponent={
          entriesQuery.isPending ? (
            <ActivityIndicator
              style={styles.loading}
              size="large"
              color={theme.brand}
            />
          ) : entriesQuery.isError && !loaded ? (
            <View style={styles.errorBox}>
              <Text style={[styles.empty, { color: theme.textSecondary }]}>
                {entriesQuery.error instanceof ApiError
                  ? entriesQuery.error.message
                  : "Couldn't load your entries."}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => entriesQuery.refetch()}
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
                ? "No entries match your search."
                : "You haven't entered any draws yet."}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <EntryRow
            entry={item}
            onViewDetails={() => {
              setDetailsEntry(item);
              setDetailsOpen(true);
            }}
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
