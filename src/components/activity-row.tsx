import { Image } from "expo-image";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/text";

import { Spacing } from "@/constants/theme";
import type { Activity } from "@/data/draws";
import { useTheme } from "@/hooks/use-theme";

/** Exported icons (tinted with the theme text colour), with their native sizes. */
const IMAGE_ICONS = {
  purchase: {
    source: require("@/assets/images/activity/Ticket.png"),
    width: 18,
    height: 14,
  },
  joined: {
    source: require("@/assets/images/activity/smallcar.png"),
    width: 18,
    height: 16,
  },
} as const;

const SYMBOLS: Record<"saved", SymbolViewProps["name"]> = {
  saved: { ios: "bookmark", android: "bookmark", web: "bookmark" },
};

export function ActivityRow({ activity }: { activity: Activity }) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={[styles.icon, { backgroundColor: theme.activityIcon }]}>
        {activity.kind === "saved" ? (
          <SymbolView name={SYMBOLS.saved} tintColor={theme.text} size={18} />
        ) : (
          <Image
            source={IMAGE_ICONS[activity.kind].source}
            style={{
              width: IMAGE_ICONS[activity.kind].width,
              height: IMAGE_ICONS[activity.kind].height,
            }}
            contentFit="contain"
            tintColor={theme.text}
          />
        )}
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {activity.title}
        </Text>
        <Text
          style={[styles.meta, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {activity.subtitle}
        </Text>
      </View>
      <Text style={[styles.meta, { color: theme.textSecondary }]}>
        {activity.time}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 56,
    borderRadius: 28,
    paddingHorizontal: Spacing.two + Spacing.one,
    paddingVertical: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two + Spacing.one,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 12,
    fontWeight: "500",
  },
  meta: {
    fontSize: 10,
  },
});
