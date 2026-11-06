import { all } from "country-codes-list";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type Country = {
  /** ISO 3166-1 alpha-2, e.g. "NG" */
  code: string;
  name: string;
  /** Calling code without the plus sign, e.g. "234" */
  dialCode: string;
  /** Flag emoji */
  flag: string;
};

const COUNTRIES: Country[] = all()
  .filter((c) => c.countryCallingCode && c.flag)
  .map((c) => ({
    code: c.countryCode,
    name: c.countryNameEn,
    dialCode: c.countryCallingCode,
    flag: c.flag,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.code === "NG") ?? COUNTRIES[0];

type CountryPickerProps = {
  visible: boolean;
  selected: Country;
  onSelect: (country: Country) => void;
  onClose: () => void;
};

export function CountryPicker({
  visible,
  selected,
  onSelect,
  onClose,
}: CountryPickerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase() === q ||
        c.dialCode.startsWith(q),
    );
  }, [query]);

  const close = () => {
    setQuery("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={close}
          accessibilityLabel="Close country list"
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.background,
              paddingBottom: Math.max(insets.bottom, Spacing.three),
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.prefix }]} />
          <Text style={[styles.heading, { color: theme.text }]}>
            Select country
          </Text>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search country or code"
            placeholderTextColor={theme.placeholder}
            autoCorrect={false}
            style={[
              styles.search,
              { backgroundColor: theme.greyButton, color: theme.text },
            ]}
          />

          <FlatList
            data={results}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: theme.textSecondary }]}>
                No countries found
              </Text>
            }
            renderItem={({ item }) => {
              const isSelected = item.code === selected.code;
              return (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    onSelect(item);
                    close();
                  }}
                  style={styles.row}
                >
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text
                    style={[styles.name, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text style={[styles.dial, { color: theme.textSecondary }]}>
                    +{item.dialCode}
                  </Text>
                  <View style={styles.tick}>
                    {isSelected && (
                      <SymbolView
                        name={{
                          ios: "checkmark",
                          android: "check",
                          web: "check",
                        }}
                        tintColor={theme.brand}
                        size={14}
                      />
                    )}
                  </View>
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    height: "75%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.four - Spacing.one,
    paddingTop: Spacing.two,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  heading: {
    marginTop: Spacing.three,
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  search: {
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
    height: 44,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.three - 2,
  },
  flag: {
    fontSize: 22,
  },
  name: {
    flex: 1,
    fontSize: 15,
  },
  dial: {
    fontSize: 14,
  },
  tick: {
    width: 16,
    alignItems: "center",
  },
  empty: {
    textAlign: "center",
    marginTop: Spacing.four,
    fontSize: 14,
  },
});
