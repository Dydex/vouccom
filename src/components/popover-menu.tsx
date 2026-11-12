import { useRef, useState, type ComponentRef, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { Text } from "@/components/text";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Option = { value: string; label: string };

type PopoverMenuProps = {
  /** Accessibility name of the trigger. */
  label: string;
  options: Option[];
  onSelect: (value: string) => void;
  /** What the trigger button shows (e.g. an icon). */
  children: ReactNode;
};

type Anchor = { top: number; right: number };

/** A trigger button that opens a small menu right under it, right edges lined up. */
export function PopoverMenu({
  label,
  options,
  onSelect,
  children,
}: PopoverMenuProps) {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const triggerRef = useRef<ComponentRef<typeof Pressable>>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const open = () =>
    triggerRef.current?.measureInWindow((x, y, width, height) =>
      setAnchor({
        top: y + height + Spacing.one,
        right: windowWidth - (x + width),
      }),
    );
  const close = () => setAnchor(null);

  return (
    <>
      <Pressable
        ref={triggerRef}
        collapsable={false}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: anchor !== null }}
        hitSlop={12}
        onPress={open}
      >
        {children}
      </Pressable>

      <Modal
        transparent
        statusBarTranslucent
        visible={anchor !== null}
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        {anchor && (
          <View
            style={[
              styles.menu,
              {
                top: anchor.top,
                right: anchor.right,
                backgroundColor: theme.dropdown,
                borderColor: theme.greyButton,
              },
            ]}
          >
            {options.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="menuitem"
                onPress={() => {
                  close();
                  onSelect(option.value);
                }}
                style={styles.option}
              >
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    minWidth: 140,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-end",
  },
  option: {
    minHeight: 34,
    justifyContent: "center",
  },
  optionText: {
    fontSize: 14,
  },
});
