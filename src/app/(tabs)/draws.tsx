import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { FlatList, Linking, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DrawDetailsSheet } from "@/components/draw-details-sheet";
import { DrawListRow } from "@/components/draw-list-row";
import { type FilterOption } from "@/components/filter-dropdown";
import { FiltersSheet } from "@/components/filters-sheet";
import { IconButton, ListControls } from "@/components/list-controls";
import { ListHeader } from "@/components/list-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { daysAgoRange, type DateFilter } from "@/data/date-filter";
import { ALL_DRAWS, type DrawListItem } from "@/data/draws";
import { DEFAULT_FILTERS, matchesFilters } from "@/data/filters";
import { formatDrawDateTime } from "@/data/listings";
import { useTheme } from "@/hooks/use-theme";

const SIDE = 20;

type StatusFilter = "all" | "active" | "closed";

const STATUS_LABELS = {
  live: "Live",
  upcoming: "Upcoming",
  completed: "Completed",
} as const;

const STATUS_OPTIONS: FilterOption<StatusFilter>[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];

export default function DrawsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [date, setDate] = useState<DateFilter>("today");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Kept after closing so the pop-up keeps its content while it fades out.
  const [selected, setSelected] = useState<DrawListItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const draws = useMemo(() => {
    const q = query.trim().toLowerCase();
    const [minDays, maxDays] = daysAgoRange(date);
    return ALL_DRAWS.filter(
      (d) =>
        d.daysAgo >= minDays &&
        d.daysAgo <= maxDays &&
        (status === "all" ||
          // Live and upcoming draws are active; completed ones are closed.
          (status === "closed") === (d.status === "completed")) &&
        (!q || d.title.toLowerCase().includes(q)) &&
        matchesFilters(d, filters),
    );
  }, [query, date, status, filters]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ListHeader
        title="Draws"
        backgroundColor={theme.coral}
        image={require("@/assets/images/headers/Die@4x 1.png")}
        imageWidth={215}
        imageHeight={131}
        showBack={false}
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
            // Jump to the draws the user has entered.
            leading={
              <IconButton
                label="My draws"
                onPress={() => router.push("/myDraws")}
              >
                <SymbolView
                  name={{ ios: "person", android: "person", web: "person" }}
                  tintColor={theme.text}
                  weight="bold"
                  size={18}
                />
              </IconButton>
            }
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
        renderItem={({ item }) => (
          <DrawListRow
            draw={item}
            onViewDetails={(draw) => {
              setSelected(draw);
              setDetailsOpen(true);
            }}
          />
        )}
      />

      <DrawDetailsSheet
        visible={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        status={selected ? STATUS_LABELS[selected.status] : ""}
        statusDotColor={
          selected
            ? {
                live: theme.coral,
                upcoming: theme.statusUpcoming,
                completed: theme.statusCompleted,
              }[selected.status]
            : undefined
        }
        winningEntry={selected?.winningEntry}
        dateTime={selected ? formatDrawDateTime(selected.drawDate) : ""}
        link={
          selected?.link ? { label: "YouTube", url: selected.link } : undefined
        }
        assets={selected?.assetList.map((a) => ({
          title: a.title,
          onView: a.listingId
            ? () => {
                setDetailsOpen(false);
                router.push({
                  pathname: "/listing/[id]",
                  params: { id: a.listingId! },
                });
              }
            : undefined,
        }))}
        // Live draws can be watched, finished ones replayed, upcoming ones added to a calendar.
        // TODO: the calendar needs expo-calendar.
        actionLabel={
          selected
            ? {
                live: "Watch live draw",
                upcoming: "Add to calendar",
                completed: "Watch draw replay",
              }[selected.status]
            : undefined
        }
        onAction={() => {
          if (selected?.status !== "upcoming" && selected?.link) {
            Linking.openURL(selected.link).catch(() => {});
          }
        }}
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
