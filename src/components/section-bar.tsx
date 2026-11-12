import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type SectionBarProps = {
  title: string;
  barColor: string;
  pillColor: string;
  pillTextColor: string;
  /** Defaults to the theme text colour. Set when the bar colour doesn't flip with the theme. */
  titleColor?: string;
  /** Text of the pill on the right. */
  actionLabel?: string;
  onAction?: () => void;
};

/** Rounded bar with a title and a pill button ("view all", "Add new", "See all"). */
export function SectionBar({
  title,
  barColor,
  pillColor,
  pillTextColor,
  titleColor,
  actionLabel = "view all",
  onAction,
}: SectionBarProps) {
  const theme = useTheme();

  return (
    <View style={[styles.bar, { backgroundColor: barColor }]}>
      <Text style={[styles.title, { color: titleColor ?? theme.text }]}>
        {title}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel}: ${title}`}
        onPress={onAction}
        style={[styles.pill, { backgroundColor: pillColor }]}
      >
        <Text style={[styles.pillText, { color: pillTextColor }]}>
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    marginTop: Spacing.four,
    marginBottom: Spacing.three,
    marginHorizontal: 20,
    height: 56,
    borderRadius: 20,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
  },
  pill: {
    height: 38,
    paddingHorizontal: Spacing.four - Spacing.one,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
