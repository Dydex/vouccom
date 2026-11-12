import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  FilterDropdown,
  type FilterOption,
} from "@/components/filter-dropdown";
import { FiltersSheet } from "@/components/filters-sheet";
import { FilterButton, SearchField } from "@/components/list-controls";
import { ListHeader } from "@/components/list-header";
import { ListingCard } from "@/components/listing-card";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { DEFAULT_FILTERS, matchesFilters } from "@/data/filters";
import { ALL_LISTINGS, type Listing } from "@/data/listings";
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
  default: null, 
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

  const listings = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = ALL_LISTINGS.filter(
      (l) =>
        (!q || l.title.toLowerCase().includes(q)) && matchesFilters(l, filters),
    );
    const sorter = SORTERS[sort];
    const sorted = sorter ? [...result].sort(sorter) : result;
    return sorted.length % 2 ? [...sorted, null] : sorted;
  }, [query, sort, filters]);

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
        data={listings}
        keyExtractor={(item, index) => item?.id ?? `spacer-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
          <View style={styles.controls}>
            <SearchField
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
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            No listings found
          </Text>
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
  empty: {
    marginTop: Spacing.five,
    textAlign: "center",
    fontSize: 14,
  },
});
