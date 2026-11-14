import { useEffect, useRef, useState, type ComponentRef } from "react";
import { Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";

import { Text } from "@/components/text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type CodeInputProps = {
  length: number;
  value: string;
  onChangeText: (code: string) => void;
  /** "box" for rounded squares, "circle" for round cells. */
  shape?: "box" | "circle";
  accessibilityLabel?: string;
};

/**
 * One-time-code entry: the cells display a single hidden input, so typing,
 * paste and code autofill all work. Tapping the row focuses the input.
 */
export function CodeInput({
  length,
  value,
  onChangeText,
  shape = "box",
  accessibilityLabel = "Verification code",
}: CodeInputProps) {
  const theme = useTheme();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);

  // Android keeps the input focused when the keyboard is closed with Back, so
  // tapping it again wouldn't reopen the keyboard. Blur it when the keyboard hides.
  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardDidHide", () => {
      inputRef.current?.blur();
    });
    return () => subscription.remove();
  }, []);

  // iOS ignores touches on near-invisible views, so taps on the row can't rely
  // on reaching the hidden input; focus it directly instead.
  const focusInput = () => {
    const input = inputRef.current;
    if (!input) return;
    if (input.isFocused()) {
      // Focused but keyboard closed: re-focusing is what reopens it.
      input.blur();
      requestAnimationFrame(() => input.focus());
    } else {
      input.focus();
    }
  };

  const cell = shape === "circle" ? styles.circle : styles.box;

  return (
    <Pressable
      onPress={focusInput}
      accessible={false}
      style={[styles.row, shape === "circle" && styles.circleRow]}
    >
      {Array.from({ length }, (_, i) => {
        const active = focused && i === Math.min(value.length, length - 1);
        return (
          <View
            key={i}
            style={[
              cell,
              {
                backgroundColor: theme.greyButton,
                borderColor: active ? theme.brand : "transparent",
              },
            ]}
          >
            <Text style={[styles.digit, { color: theme.text }]}>
              {value[i] ?? ""}
            </Text>
          </View>
        );
      })}

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) =>
          onChangeText(text.replace(/\D/g, "").slice(0, length))
        }
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus
        caretHidden
        accessibilityLabel={accessibilityLabel}
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.two,
  },
  circleRow: {
    gap: Spacing.two + Spacing.one,
  },
  box: {
    width: 46,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  digit: {
    fontSize: 20,
    fontWeight: "500",
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.01,
    color: "transparent",
  },
});
