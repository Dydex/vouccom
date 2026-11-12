import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

/** A white header with a back arrow and a title, for sub-screens without a coloured band. */
export function PlainHeader({
  title,
  fallback,
}: {
  title: string;
  /** Where "back" goes when there is nothing to go back to. */
  fallback: Href;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top + Spacing.three,
          shadowColor: theme.brand,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={12}
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace(fallback)
        }
      >
        <Image
          source={require("@/assets/images/common/backarrow.png")}
          style={styles.arrow}
          contentFit="contain"
          tintColor={theme.text}
        />
      </Pressable>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    // Sits over the list with a soft glow, like the Home header.
    zIndex: 1,
    paddingHorizontal: 20,
    paddingBottom: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  arrow: {
    width: 18,
    height: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
});
