import { Image } from "expo-image";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Text } from "@/components/text";
import { useTheme } from "@/hooks/use-theme";

type AvatarProps = {
  size: number;
  name: string;
  /** The profile photo; without one, the first letter of the name shows. */
  url?: string | null;
  /** Dims the circle and shows a spinner, e.g. while a new photo uploads. */
  loading?: boolean;
};

/** The user's photo in a circle, or their initial on coral. */
export function Avatar({ size, name, url, loading }: AvatarProps) {
  const theme = useTheme();
  const circle = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View
      accessibilityLabel={url ? `${name}'s profile photo` : undefined}
      style={[styles.base, circle, { backgroundColor: theme.coral }]}
    >
      {url ? (
        <Image
          source={url}
          style={circle}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <Text style={[styles.initial, { fontSize: size * 0.42 }]}>
          {name.charAt(0).toUpperCase()}
        </Text>
      )}
      {loading && (
        <View style={[styles.overlay, circle]}>
          <ActivityIndicator color="#FFFFFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initial: {
    fontWeight: "700",
    color: "#1E1F20",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});
