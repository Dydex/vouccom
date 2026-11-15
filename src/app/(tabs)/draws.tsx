import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import * as WebBrowser from "expo-web-browser";
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

import { DrawDetailsSheet } from "@/components/draw-details-sheet";
import { DrawListRow } from "@/components/draw-list-row";
import { type FilterOption } from "@/components/filter-dropdown";
import { FiltersSheet } from "@/components/filters-sheet";
import { IconButton, ListControls } from "@/components/list-controls";
import { ListHeader } from "@/components/list-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { daysAgoRange, type DateFilter } from "@/data/date-filter";
import type { DrawListItem } from "@/data/draws";
import { DEFAULT_FILTERS, matchesFilters } from "@/data/filters";
import { formatDrawDateTime } from "@/data/listings";
import { useAllDraws } from "@/hooks/use-draws";
import { useEntries } from "@/hooks/use-entries";
import { useMyTickets } from "@/hooks/use-listings";
import { useTheme } from "@/hooks/use-theme";
import { ApiError } from "@/lib/api";

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
  const [date, setDate] = useState<DateFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<DrawListItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const all = useAllDraws();
  const loaded = all.draws;

  const onRefresh = async () => {
    setRefreshing(true);
    await all.refetch();
    setRefreshing(false);
  };

  // The result and replay of a draw only come back for draws the user entered.
  const entries = useEntries();
  const entered = !!entries.data?.some((e) => e.id === selected?.id);
  const tickets = useMyTickets(
    selected?.id ?? "",
    detailsOpen && selected?.status === "completed" && entered,
  );
  const winner = tickets.data?.winner;
  const winningEntry = winner ? `#${winner.ticketNumber}` : undefined;
  const replay = winner?.drawVideoUrl ?? undefined;

  const draws = useMemo(() => {
    const q = query.trim().toLowerCase();
    const [minDays, maxDays] = daysAgoRange(date);
    return (loaded ?? []).filter(
      (d) =>
        d.daysAgo >= minDays &&
        d.daysAgo <= maxDays &&
        (status === "all" ||
          (status === "closed") === (d.status === "completed")) &&
        (!q || d.title.toLowerCase().includes(q)) &&
        matchesFilters(d, filters),
    );
  }, [loaded, query, date, status, filters]);

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
            // Jump to the draws the user has entered.
            leading={
              <IconButton
                label="My draws"
                onPress={() => router.push("/home/myDraws")}
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
          all.isPending ? (
            <ActivityIndicator
              style={styles.loading}
              size="large"
              color={theme.brand}
            />
          ) : all.error && !loaded ? (
            <View style={styles.errorBox}>
              <Text style={[styles.empty, { color: theme.textSecondary }]}>
                {all.error instanceof ApiError
                  ? all.error.message
                  : "Couldn't load the draws."}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => all.refetch()}
                hitSlop={8}
              >
                <Text style={[styles.retryText, { color: theme.brand }]}>
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : (
            <Text style={[styles.empty, { color: theme.textSecondary }]}>
              {loaded?.length ? "No draws match your search." : "No draws yet."}
            </Text>
          )
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
        winningEntry={winningEntry}
        dateTime={selected ? formatDrawDateTime(selected.drawDate) : ""}
        link={replay ? { label: "YouTube", url: replay } : undefined}
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
        // TODO: "Watch live draw" and "Add to calendar" once the API has a
        // stream link and the app has expo-calendar.
        actionLabel={
          selected?.status === "completed" && replay
            ? "Watch draw replay"
            : undefined
        }
        onAction={() => {
          if (replay) WebBrowser.openBrowserAsync(replay).catch(() => {});
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
