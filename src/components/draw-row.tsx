import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Spacing } from "@/constants/theme";
import type { Draw } from "@/data/draws";
import { useTheme } from "@/hooks/use-theme";

type DrawRowProps = {
  draw: Draw;
  onWatch?: (draw: Draw) => void;
  onViewDetails?: (draw: Draw) => void;
};

export function DrawRow({ draw, onWatch, onViewDetails }: DrawRowProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.text}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {draw.title}
        </Text>
        {draw.live ? (
          <View style={styles.liveRow}>
            <View style={[styles.dot, { backgroundColor: theme.coral }]} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              Live
            </Text>
          </View>
        ) : (
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              {draw.drawDate} · {draw.daysLeft}{" "}
              {draw.daysLeft === 1 ? "day" : "days"} left
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View details for ${draw.title}`}
              hitSlop={8}
              // TODO: navigate to the draw details screen once it exists.
              onPress={() => onViewDetails?.(draw)}
            >
              <Text style={[styles.meta, { color: theme.textSecondary }]}>
                View details
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {draw.live && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Watch ${draw.title} live`}
          hitSlop={8}
          // TODO: open the live draw once it exists.
          onPress={() => onWatch?.(draw)}
        >
          <SymbolView
            name={{
              ios: "play.circle",
              android: "play_circle",
              web: "play_circle",
            }}
            tintColor={theme.coral}
            size={38}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one + Spacing.half,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  meta: {
    fontSize: 10,
  },
});
