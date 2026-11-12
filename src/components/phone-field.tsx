import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, TextInput } from "@/components/text";

import { CountryPicker, type Country } from "@/components/country-picker";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type PhoneFieldProps = {
  country: Country;
  onCountryChange: (country: Country) => void;
  value: string;
  onChangeText: (text: string) => void;
};

/** Phone number input with a tappable country-code prefix that opens the country picker. */
export function PhoneField({
  country,
  onCountryChange,
  value,
  onChangeText,
}: PhoneFieldProps) {
  const theme = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <View style={[styles.wrap, { backgroundColor: theme.greyButton }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Country code, ${country.name} +${country.dialCode}`}
        onPress={() => setPickerOpen(true)}
        style={[styles.prefix, { backgroundColor: theme.prefix }]}
      >
        <Text style={styles.flag}>{country.flag}</Text>
        <SymbolView
          name={{
            ios: "chevron.down",
            android: "keyboard_arrow_down",
            web: "keyboard_arrow_down",
          }}
          tintColor={theme.text}
          size={12}
        />
        <View style={[styles.divider, { backgroundColor: theme.text }]} />
        <Text style={[styles.dialCode, { color: theme.placeholder }]}>
          +{country.dialCode}
        </Text>
      </Pressable>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Phone Number"
        placeholderTextColor={theme.placeholder}
        keyboardType="phone-pad"
        autoComplete="tel"
        style={[styles.input, { color: theme.text }]}
      />

      <CountryPicker
        visible={pickerOpen}
        selected={country}
        onSelect={onCountryChange}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 44,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  prefix: {
    height: "100%",
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  flag: {
    fontSize: 20,
  },
  divider: {
    width: 1,
    height: 18,
    opacity: 0.6,
  },
  dialCode: {
    fontSize: 14,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: Spacing.three,
    fontSize: 14,
  },
});
