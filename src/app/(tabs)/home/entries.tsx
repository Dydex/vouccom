import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EntryRow } from "@/components/entry-row";
import { type FilterOption } from "@/components/filter-dropdown";
import { FiltersSheet } from "@/components/filters-sheet";
import { ListControls } from "@/components/list-controls";
import { ListHeader } from "@/components/list-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { daysAgoRange, type DateFilter } from "@/data/date-filter";
import { ENTRIES } from "@/data/entries";
import { DEFAULT_FILTERS, matchesFilters } from "@/data/filters";
import { useTheme } from "@/hooks/use-theme";

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
  const [date, setDate] = useState<DateFilter>("today");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const [minDays, maxDays] = daysAgoRange(date);
    return ENTRIES.filter(
      (e) =>
        e.enteredDaysAgo >= minDays &&
        e.enteredDaysAgo <= maxDays &&
        (status === "all" ||
          e.status === (status === "closed" ? "completed" : status)) &&
        (!q || e.title.toLowerCase().includes(q)) &&
        matchesFilters(e, filters),
    );
  }, [query, date, status, filters]);

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
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            No entries found
          </Text>
        }
        renderItem={({ item }) => <EntryRow entry={item} />}
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
  empty: {
    marginTop: Spacing.five,
    textAlign: "center",
    fontSize: 14,
  },
});
