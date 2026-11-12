import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ListHeaderProps = {
  title: string;
  backgroundColor: string;
  /** Result of require("...png"): a pre-cropped export that sits on the band's bottom edge. */
  image?: number;
  imageWidth?: number;
  imageHeight?: number;
  /** Distance from the right edge. Negative values let transparent padding hang off-screen. */
  imageRight?: number;
  /** Defaults to dark icons, for light bands. Use "auto" for a band that follows the theme. */
  statusBarStyle?: "dark" | "light" | "auto";
  /** Tab screens have no back arrow. */
  showBack?: boolean;
  /** Colour of the title and back arrow. Defaults to dark. */
  contentColor?: string;
  /** Where "back" goes when there is nothing to go back to. */
  backFallback?: Href;
  /** Extra content under the title inside the band, such as a search field. */
  children?: ReactNode;
};

/** Coloured band with a back arrow, a title and an illustration (My Entries, My Draws). */
export function ListHeader({
  title,
  backgroundColor,
  image,
  imageWidth,
  imageHeight,
  imageRight = 16,
  statusBarStyle = "dark",
  showBack = true,
  contentColor,
  backFallback = "/home",
  children,
}: ListHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const color = contentColor ?? theme.onBadge;

  return (
    <View style={[styles.header, { backgroundColor, paddingTop: insets.top }]}>
      <StatusBar style={statusBarStyle} />
      {image !== undefined && (
        <Image
          source={image}
          style={[
            styles.illustration,
            { width: imageWidth, height: imageHeight, right: imageRight },
          ]}
          contentFit="contain"
        />
      )}
      <View style={styles.titleRow}>
        {showBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace(backFallback)
            }
          >
            <Image
              source={require("@/assets/images/common/backarrow.png")}
              style={styles.backArrow}
              contentFit="contain"
              tintColor={color}
            />
          </Pressable>
        )}
        <Text style={[styles.title, { color }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 144,
    overflow: "hidden",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: Spacing.three,
  },
  illustration: {
    position: "absolute",
    bottom: 0,
  },
  backArrow: {
    width: 18,
    height: 14, // backarrow.png is a 4x export (72x56)
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
  },
});
