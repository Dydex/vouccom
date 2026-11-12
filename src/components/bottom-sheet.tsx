import { SymbolView } from "expo-symbols";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Scrollable body. */
  children: ReactNode;
  /** Pinned under the body (buttons). */
  footer?: ReactNode;
  /** Fill most of the screen instead of fitting the content. */
  tall?: boolean;
};

/** Rounded sheet over a dimmed screen: title and close button, scrolling body, pinned footer. */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  footer,
  tall,
}: BottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <Modal
      transparent
      statusBarTranslucent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel={`Close ${title}`}
        />

        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.menu },
            tall ? { height: height * 0.84 } : { maxHeight: height * 0.88 },
          ]}
        >
          <View
            style={[styles.header, { borderBottomColor: theme.greyButton }]}
          >
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
              onPress={onClose}
            >
              <SymbolView
                name={{ ios: "xmark", android: "close", web: "close" }}
                tintColor={theme.text}
                size={20}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={tall ? styles.flex : styles.shrink}
            contentContainerStyle={styles.content}
          >
            {children}
          </ScrollView>

          {footer && (
            <View
              style={[
                styles.footer,
                {
                  // A background is needed for the shadow to show on iOS.
                  backgroundColor: theme.menu,
                  shadowColor: theme.brand,
                  paddingBottom: Math.max(insets.bottom, 12) + Spacing.one,
                },
              ]}
            >
              {footer}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const SIDE = 20;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  header: {
    height: 68,
    paddingHorizontal: SIDE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
  },
  flex: {
    flex: 1,
  },
  shrink: {
    flexShrink: 1,
  },
  content: {
    paddingHorizontal: SIDE,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.five,
  },
  footer: {
    paddingTop: Spacing.three,
    paddingHorizontal: SIDE,
    // Soft blue glow above the buttons, setting them apart from the content.
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
    elevation: 8,
  },
});
