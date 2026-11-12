import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";

import { Spacing } from "@/constants/theme";
import { entryMeta, type Entry } from "@/data/entries";
import { useTheme } from "@/hooks/use-theme";

type EntryRowProps = {
  entry: Entry;
  /** Defaults to the shared card colour (or the win colour for won entries). */
  backgroundColor?: string;
  onViewDetails?: (entry: Entry) => void;
};

export function EntryRow({
  entry,
  backgroundColor,
  onViewDetails,
}: EntryRowProps) {
  const theme = useTheme();

  const bg = backgroundColor ?? (entry.won ? theme.winRow : theme.card);

  return (
    <View style={[styles.card, { backgroundColor: bg }]}>
      {entry.won && (
        <View style={[styles.star, { backgroundColor: theme.winsBar }]}>
          <SymbolView
            name={{ ios: "star", android: "star", web: "star" }}
            tintColor={theme.onBadge}
            size={12}
          />
        </View>
      )}
      <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
        {entry.title}
      </Text>
      <View style={styles.meta}>
        <Text style={[styles.metaText, { color: theme.textSecondary }]}>
          {entryMeta(entry)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View details for ${entry.title}`}
          hitSlop={8}
          // TODO: navigate to the entry details screen once it exists.
          onPress={() => onViewDetails?.(entry)}
        >
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            View details
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    gap: Spacing.half,
  },
  star: {
    position: "absolute",
    top: -8,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaText: {
    fontSize: 10,
  },
});
