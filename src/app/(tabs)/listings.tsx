import { useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text, type TextInputHandle } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  FilterDropdown,
  type FilterOption,
} from "@/components/filter-dropdown";
import { FiltersSheet } from "@/components/filters-sheet";
import { FilterButton, SearchField } from "@/components/list-controls";
import { ListHeader } from "@/components/list-header";
import { ListingCard } from "@/components/listing-card";
import { useToast } from "@/components/toast";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { DEFAULT_FILTERS, matchesFilters, rangeFor } from "@/data/filters";
import type { Listing } from "@/data/listings";
import { useListings } from "@/hooks/use-listings";
import { takeSearchFocusRequest } from "@/lib/search-focus";
import { useTheme } from "@/hooks/use-theme";

const SIDE = 20;
const GAP = Spacing.three;

type Sort = "default" | "newest" | "closing" | "price";

const SORT_OPTIONS: FilterOption<Sort>[] = [
  { value: "default", label: "Default sorting" },
  { value: "newest", label: "New to old" },
  { value: "closing", label: "Closing Soon" },
  { value: "price", label: "Voucher price" },
];

const SORTERS: Record<Sort, ((a: Listing, b: Listing) => number) | null> = {
  default: null, // keep the API order: soonest draw first
  newest: (a, b) => a.listedDaysAgo - b.listedDaysAgo,
  closing: (a, b) => a.daysLeft - b.daysLeft,
  price: (a, b) => a.voucherPrice - b.voucherPrice,
};

export default function ListingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("default");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Home's search button: focus the search field when this tab comes into view.
  const listRef = useRef<FlatList>(null);
  const searchRef = useRef<TextInputHandle>(null);
  useFocusEffect(
    useCallback(() => {
      if (!takeSearchFocusRequest()) return;
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
      // After the tab switch has finished, or the keyboard may not open.
      const timer = setTimeout(() => searchRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }, []),
  );

  const toast = useToast();
  const {
    listings: loaded,
    status,
    error,
    refreshing,
    loadingMore,
    refresh,
    retry,
    loadMore,
  } = useListings();

  // Search, sort and filters run on the listings loaded so far: the API has no
  // parameters for them yet.
  const searching = query.trim() !== "" || filters !== DEFAULT_FILTERS;
  const listings = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = loaded.filter(
      (l) =>
        (!q || l.title.toLowerCase().includes(q)) && matchesFilters(l, filters),
    );
    const sorter = SORTERS[sort];
    const sorted = sorter ? [...result].sort(sorter) : result;
    return sorted.length % 2 ? [...sorted, null] : sorted;
  }, [loaded, query, sort, filters]);

  // The value slider spans the cheapest to the most valuable listing loaded.
  const assetBounds = useMemo(
    () => rangeFor(loaded.map((l) => l.assetValue)),
    [loaded],
  );

  const onRefresh = async () => {
    const ok = await refresh();
    if (!ok) {
      toast.show({
        tone: "error",
        message: "Couldn't refresh the listings. Pull to try again.",
      });
    }
  };

  const removeBrand = (brand: string) =>
    setFilters((f) => ({ ...f, brands: f.brands.filter((b) => b !== brand) }));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ListHeader
        title="Browse Listings"
        backgroundColor={theme.brand}
        image={require("@/assets/images/headers/Discover 3.png")}
        imageWidth={206}
        imageHeight={95}
        imageRight={0}
        showBack={false}

        statusBarStyle="light"
        contentColor={theme.onBrand}
      />

      <FlatList
        ref={listRef}
        data={listings}
        keyExtractor={(item, index) => item?.id ?? `spacer-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.brand}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.footer} color={theme.brand} />
          ) : undefined
        }
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom:
              FloatingTabBarHeight + Math.max(insets.bottom, 12) + Spacing.five,
          },
        ]}
        ListHeaderComponent={
          <View style={styles.controls}>
            <SearchField
              inputRef={searchRef}
              placeholder="Search listings"
              value={query}
              onChangeText={setQuery}
            />

            <View style={styles.filterRow}>
              <FilterButton onPress={() => setFiltersOpen(true)} />
              <FilterDropdown
                label="Sort"
                value={sort}
                options={SORT_OPTIONS}
                onChange={setSort}
                align="left"
              />
            </View>

            {filters.brands.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
              >
                {filters.brands.map((brand) => (
                  <Pressable
                    key={brand}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${brand} filter`}
                    onPress={() => removeBrand(brand)}
                    style={[styles.chip, { backgroundColor: theme.card }]}
                  >
                    <Text style={[styles.chipText, { color: theme.text }]}>
                      {brand}
                    </Text>
                    <SymbolView
                      name={{ ios: "xmark", android: "close", web: "close" }}
                      tintColor={theme.text}
                      size={11}
                    />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        }
        ListEmptyComponent={
          status === "loading" ? (
            <ActivityIndicator
              style={styles.loading}
              size="large"
              color={theme.brand}
            />
          ) : status === "error" ? (
            <View style={styles.errorBox}>
              <Text style={[styles.empty, { color: theme.textSecondary }]}>
                {error?.message ?? "Couldn't load the listings."}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={retry}
                style={({ pressed }) => [
                  styles.retry,
                  { backgroundColor: theme.brand },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.retryText, { color: theme.onBrand }]}>
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : (
            <Text style={[styles.empty, { color: theme.textSecondary }]}>
              {searching
                ? "No listings match your search."
                : "No listings yet."}
            </Text>
          )
        }
        renderItem={({ item }) =>
          item ? (
            <ListingCard listing={item} compact fluid />
          ) : (
            <View style={styles.spacer} />
          )
        }
      />

      <FiltersSheet
        assetBounds={assetBounds}
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
    gap: GAP,
  },
  row: {
    gap: GAP,
  },
  controls: {
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chips: {
    gap: Spacing.two,
  },
  chip: {
    height: 36,
    paddingHorizontal: Spacing.three,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  chipText: {
    fontSize: 13,
  },
  spacer: {
    flex: 1,
  },
  loading: {
    marginTop: Spacing.six,
  },
  footer: {
    marginVertical: Spacing.four,
  },
  errorBox: {
    alignItems: "center",
    gap: Spacing.three,
  },
  retry: {
    height: 40,
    paddingHorizontal: Spacing.four,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
  empty: {
    marginTop: Spacing.five,
    textAlign: "center",
    fontSize: 14,
  },
});
