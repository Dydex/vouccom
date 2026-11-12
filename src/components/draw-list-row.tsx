import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";

import { Spacing } from "@/constants/theme";
import type { DrawListItem, DrawStatus } from "@/data/draws";
import { useTheme } from "@/hooks/use-theme";

const LABELS: Record<DrawStatus, string> = {
  live: "Live",
  upcoming: "Upcoming",
  completed: "Completed",
};

/** One draw on the Draws tab: status, title, and a summary line. */
export function DrawListRow({
  draw,
  onViewDetails,
}: {
  draw: DrawListItem;
  onViewDetails?: (draw: DrawListItem) => void;
}) {
  const theme = useTheme();

  const dot = {
    live: theme.coral,
    upcoming: theme.statusUpcoming,
    completed: theme.statusCompleted,
  }[draw.status];

  const title = draw.extraAssets
    ? `${draw.title} + ${draw.extraAssets} more ...`
    : draw.title;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View details for ${draw.title}`}
      onPress={() => onViewDetails?.(draw)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: dot }]} />
        <Text style={[styles.status, { color: theme.textSecondary }]}>
          {LABELS[draw.status]}
        </Text>
      </View>

      <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          {draw.assets} Asset · {draw.date} - {draw.timeLabel}
        </Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          View details
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    gap: Spacing.one,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  status: {
    fontSize: 11,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  meta: {
    fontSize: 11,
  },
  pressed: {
    opacity: 0.85,
  },
});
