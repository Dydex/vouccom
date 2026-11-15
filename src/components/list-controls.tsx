import { Image } from "expo-image";
import { useRef, type ReactNode, type Ref } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { TextInput, type TextInputHandle } from "@/components/text";

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
  /** An extra round button placed before the filter button. */
  leading?: ReactNode;
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
  inputRef,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  /** For focusing the field from code. */
  inputRef?: Ref<TextInputHandle>;
}) {
  const theme = useTheme();
  const localRef = useRef<TextInputHandle | null>(null);

  // Keep our own handle on the input and pass it on to the caller's ref.
  const setRef = (node: TextInputHandle | null) => {
    localRef.current = node;
    if (typeof inputRef === "function") inputRef(node);
    else if (inputRef) inputRef.current = node;
  };

  return (
    <Pressable
      accessible={false}
      onPress={() => localRef.current?.focus()}
      style={[styles.search, { backgroundColor: theme.card }]}
    >
      <Image
        source={require("@/assets/images/common/Search.png")}
        style={styles.searchIcon}
        contentFit="contain"
        tintColor={theme.search}
      />
      <TextInput
        ref={setRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        returnKeyType="search"
        autoCorrect={false}
        style={[styles.searchInput, { color: theme.text }]}
      />
    </Pressable>
  );
}

/** Round grey icon button used beside the search field. */
export function IconButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress?: () => void;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.filterButton, { backgroundColor: theme.card }]}
    >
      {children}
    </Pressable>
  );
}

export function FilterButton({ onPress }: { onPress?: () => void }) {
  const theme = useTheme();

  return (
    <IconButton label="Filters" onPress={onPress}>
      <Image
        source={require("@/assets/images/common/Filter.png")}
        style={styles.filterIcon}
        contentFit="contain"
        tintColor={theme.text}
      />
    </IconButton>
  );
}

/** Search field plus filter button, Date and Status pills (My Entries, My Draws). */
export function ListControls<S extends string>({
  searchPlaceholder,
  query,
  onQueryChange,
  onFilterPress,
  leading,
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
        <View style={styles.leftButtons}>
          {leading}
          <FilterButton onPress={onFilterPress} />
        </View>
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
  filterIcon: {
    width: 20,
    height: 20, // Filter.png is a 4x export (80x80)
  },
  filterButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  leftButtons: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  dropdowns: {
    flexDirection: "row",
    gap: Spacing.two,
  },
});
