import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import {
  FilterDropdown,
  type FilterOption,
} from "@/components/filter-dropdown";
import { Spacing } from "@/constants/theme";
import { DATE_OPTIONS, type DateFilter } from "@/data/date-filter";
import { useTheme } from "@/hooks/use-theme";

type ListControlsProps<S extends string> = {
  searchPlaceholder: string;
  query: string;
  onQueryChange: (query: string) => void;
  onFilterPress?: () => void;
  date: DateFilter;
  onDateChange: (date: DateFilter) => void;
  status: S;
  statusOptions: FilterOption<S>[];
  /** The status that means "no status filter"; the pill then reads "Status". */
  allStatus: S;
  onStatusChange: (status: S) => void;
};

export function SearchField({
  placeholder,
  value,
  onChangeText,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.search, { backgroundColor: theme.card }]}>
      <Image
        source={require("@/assets/images/common/Search.png")}
        style={styles.searchIcon}
        contentFit="contain"
        tintColor={theme.search}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        returnKeyType="search"
        autoCorrect={false}
        style={[styles.searchInput, { color: theme.text }]}
      />
    </View>
  );
}

export function FilterButton({ onPress }: { onPress?: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Filters"
      onPress={onPress}
      style={[styles.filterButton, { backgroundColor: theme.card }]}
    >
      <SymbolView
        name={{ ios: "slider.horizontal.3", android: "tune", web: "tune" }}
        tintColor={theme.text}
        size={18}
      />
    </Pressable>
  );
}

/** Search field plus filter button, Date and Status pills (My Entries, My Draws). */
export function ListControls<S extends string>({
  searchPlaceholder,
  query,
  onQueryChange,
  onFilterPress,
  date,
  onDateChange,
  status,
  statusOptions,
  allStatus,
  onStatusChange,
}: ListControlsProps<S>) {

  return (
    <View style={styles.controls}>
      <SearchField
        placeholder={searchPlaceholder}
        value={query}
        onChangeText={onQueryChange}
      />

      <View style={styles.filters}>
        <FilterButton onPress={onFilterPress} />
        <View style={styles.dropdowns}>
          <FilterDropdown
            label="Date"
            value={date}
            options={DATE_OPTIONS}
            onChange={onDateChange}
          />
          <FilterDropdown
            label="Status"
            value={status}
            options={statusOptions}
            emptyValue={allStatus}
            onChange={onStatusChange}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
    gap: Spacing.three,
  },
  search: {
    height: 48,
    borderRadius: 24,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  searchIcon: {
    width: 18,
    height: 18,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
  },
  filters: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdowns: {
    flexDirection: "row",
    gap: Spacing.two,
  },
});
