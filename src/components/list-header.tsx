import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ListHeaderProps = {
  title: string;
  backgroundColor: string;
  /** Result of require("...png"): a pre-cropped export that sits on the band's bottom edge. */
  image: number;
  imageWidth: number;
  imageHeight: number;
  /** Distance from the right edge. Negative values let transparent padding hang off-screen. */
  imageRight?: number;
  /** Defaults to dark icons, for light bands. Use "auto" for a band that follows the theme. */
  statusBarStyle?: "dark" | "light" | "auto";
  /** Tab screens have no back arrow. */
  showBack?: boolean;
  /** Colour of the title and back arrow. Defaults to dark. */
  contentColor?: string;
};

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace("/home");
}

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
}: ListHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const color = contentColor ?? theme.onBadge;

  return (
    <View style={[styles.header, { backgroundColor, paddingTop: insets.top }]}>
      <StatusBar style={statusBarStyle} />
      <Image
        source={image}
        style={[
          styles.illustration,
          { width: imageWidth, height: imageHeight, right: imageRight },
        ]}
        contentFit="contain"
      />
      <View style={styles.titleRow}>
        {showBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={goBack}
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
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 144,
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
