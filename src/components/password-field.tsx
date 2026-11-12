import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, StyleSheet, type TextInputProps, View } from "react-native";
import { TextInput } from "@/components/text";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type PasswordFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  autoComplete?: TextInputProps["autoComplete"];
};

/** Pill-shaped password input with a show/hide eye toggle. */
export function PasswordField({
  value,
  onChangeText,
  placeholder,
  autoComplete,
}: PasswordFieldProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.wrap, { backgroundColor: theme.greyButton }]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoComplete={autoComplete}
        style={[styles.input, { color: theme.text }]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={visible ? "Hide password" : "Show password"}
        onPress={() => setVisible((v) => !v)}
        hitSlop={10}
      >
        <SymbolView
          name={
            visible
              ? {
                  ios: "eye.slash",
                  android: "visibility_off",
                  web: "visibility_off",
                }
              : { ios: "eye", android: "visibility", web: "visibility" }
          }
          tintColor={theme.eyeIcon}
          size={20}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 44,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
  },
});
