import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EntryRow } from "@/components/entry-row";
import { type FilterOption } from "@/components/filter-dropdown";
import { FiltersSheet } from "@/components/filters-sheet";
import { ListControls } from "@/components/list-controls";
import { ListHeader } from "@/components/list-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { daysAgoRange, type DateFilter } from "@/data/date-filter";
import { WINS } from "@/data/entries";
import { DEFAULT_FILTERS, matchesFilters } from "@/data/filters";
import { useTheme } from "@/hooks/use-theme";

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
  const [date, setDate] = useState<DateFilter>("today");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const wins = useMemo(() => {
    const q = query.trim().toLowerCase();
    const [minDays, maxDays] = daysAgoRange(date);
    return WINS.filter(
      (w) =>
        w.enteredDaysAgo >= minDays &&
        w.enteredDaysAgo <= maxDays &&
        (status === "all" ||
          w.status === (status === "closed" ? "completed" : status)) &&
        (!q || w.title.toLowerCase().includes(q)) &&
        matchesFilters(w, filters),
    );
  }, [query, date, status, filters]);

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
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            No wins found
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
    gap: Spacing.two,
  },
  controlsGap: {
    paddingBottom: Spacing.three,
  },
  empty: {
    marginTop: Spacing.five,
    textAlign: "center",
    fontSize: 14,
  },
});
