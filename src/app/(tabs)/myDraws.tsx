import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DrawRow } from "@/components/draw-row";
import { type FilterOption } from "@/components/filter-dropdown";
import { FiltersSheet } from "@/components/filters-sheet";
import { ListControls } from "@/components/list-controls";
import { ListHeader } from "@/components/list-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { daysAgoRange, type DateFilter } from "@/data/date-filter";
import { DRAWS } from "@/data/draws";
import { DEFAULT_FILTERS, matchesFilters } from "@/data/filters";
import { useTheme } from "@/hooks/use-theme";

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
  const [date, setDate] = useState<DateFilter>("today");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const draws = useMemo(() => {
    const q = query.trim().toLowerCase();
    const [minDays, maxDays] = daysAgoRange(date);
    return DRAWS.filter(
      (d) =>
        d.enteredDaysAgo >= minDays &&
        d.enteredDaysAgo <= maxDays &&
        (status === "all" || (status === "live") === !!d.live) &&
        (!q || d.title.toLowerCase().includes(q)) &&
        matchesFilters(d, filters),
    );
  }, [query, date, status, filters]);

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
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            No draws found
          </Text>
        }
        renderItem={({ item }) => <DrawRow draw={item} />}
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
