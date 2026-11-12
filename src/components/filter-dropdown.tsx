import { SymbolView } from "expo-symbols";
import { useRef, useState, type ComponentRef } from "react";
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { Text } from "@/components/text";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type FilterOption<T extends string> = { value: T; label: string };

type FilterDropdownProps<T extends string> = {
  /** Accessibility name for the pill, and its text while `value === emptyValue`. */
  label: string;
  value: T;
  options: FilterOption<T>[];
  onChange: (value: T) => void;
  /** When `value` equals this, the pill shows `label` instead of the option's label. */
  emptyValue?: T;
  /** Which side the option text sits on in the menu. */
  align?: "left" | "right";
};

type Anchor = { top: number; right: number; minWidth: number };

/** Pill button that opens a small menu anchored under it. */
export function FilterDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  emptyValue,
  align = "right",
}: FilterDropdownProps<T>) {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const pillRef = useRef<ComponentRef<typeof Pressable>>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const current = options.find((o) => o.value === value);
  const pillText = value === emptyValue ? label : (current?.label ?? label);

  const openMenu = () => {
    pillRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({
        top: y + height + Spacing.two,
        // Right edges of the pill and the menu line up.
        right: windowWidth - (x + width),
        minWidth: width,
      });
    });
  };

  const close = () => setAnchor(null);
  const open = anchor !== null;

  return (
    <>
      <Pressable
        ref={pillRef}
        collapsable={false}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${pillText}`}
        accessibilityState={{ expanded: open }}
        onPress={openMenu}
        style={[styles.pill, { backgroundColor: theme.card }]}
      >
        <Text style={[styles.pillText, { color: theme.text }]}>{pillText}</Text>
        <SymbolView
          name={
            open
              ? {
                  ios: "chevron.up",
                  android: "keyboard_arrow_up",
                  web: "keyboard_arrow_up",
                }
              : {
                  ios: "chevron.down",
                  android: "keyboard_arrow_down",
                  web: "keyboard_arrow_down",
                }
          }
          tintColor={theme.text}
          weight="bold"
          size={12}
        />
      </Pressable>

      <Modal
        transparent
        statusBarTranslucent
        visible={open}
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={close}
          accessibilityLabel="Close menu"
        />
        {anchor && (
          <View
            style={[
              styles.menu,
              {
                top: anchor.top,
                right: anchor.right,
                minWidth: anchor.minWidth,
                backgroundColor: theme.dropdown,
                alignItems: align === "left" ? "flex-start" : "flex-end",
                borderColor: theme.greyButton,
              },
            ]}
          >
            {options.map((option) => {
              const selected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onChange(option.value);
                    close();
                  }}
                  style={styles.option}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: selected ? theme.brand : theme.text },
                      selected && styles.optionSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 38,
    paddingHorizontal: Spacing.three,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "500",
  },
  menu: {
    position: "absolute",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
    // No shadow, so a thin border keeps the menu readable over the list.
    borderWidth: StyleSheet.hairlineWidth,
  },
  option: {
    minHeight: 30,
    justifyContent: "center",
  },
  optionText: {
    fontSize: 13,
  },
  optionSelected: {
    fontWeight: "600",
  },
});
