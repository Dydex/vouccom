import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { BottomSheet } from "@/components/bottom-sheet";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type DrawSheetAsset = {
  title: string;
  /** Called when "View asset" is tapped. */
  onView?: () => void;
};

type DrawDetailsSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** e.g. "Upcoming" */
  status: string;
  /** Colour of the dot before the status. Leave out for no dot. */
  statusDotColor?: string;
  /** The winning entry of a completed draw, e.g. "#10393". */
  winningEntry?: string;
  /** e.g. "7 September · 8:00PM" */
  dateTime: string;
  /** Where the draw is streamed, if anywhere. */
  link?: { label: string; url: string };
  /** The assets up for grabs, when a draw has several. */
  assets?: DrawSheetAsset[];
  /** Label of the button pinned at the bottom, e.g. "Add to calendar". No label, no button. */
  actionLabel?: string;
  onAction?: () => void;
};

/** "Draw Details" pop-up: assets, status, date and time, and where to watch. */
export function DrawDetailsSheet({
  visible,
  onClose,
  status,
  statusDotColor,
  winningEntry,
  dateTime,
  link,
  assets,
  actionLabel,
  onAction,
}: DrawDetailsSheetProps) {
  const theme = useTheme();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Draw Details"
      footer={
        actionLabel ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.brand },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.buttonText, { color: theme.onBrand }]}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : undefined
      }
    >
      {assets && assets.length > 0 && (
        <>
          <View style={styles.assets}>
            <Text style={[styles.value, { color: theme.textSecondary }]}>
              {assets.length === 1 ? "Asset" : "Assets"}
            </Text>
            {assets.map((asset) => (
              <View key={asset.title} style={styles.assetRow}>
                <Text
                  style={[styles.assetTitle, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {asset.title}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`View asset ${asset.title}`}
                  hitSlop={8}
                  onPress={asset.onView}
                >
                  <Text
                    style={[styles.viewAsset, { color: theme.textSecondary }]}
                  >
                    View asset
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
          <View
            style={[styles.divider, { backgroundColor: theme.greyButton }]}
          />
        </>
      )}

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.text }]}>Draw Status</Text>
        <View style={styles.statusRow}>
          {statusDotColor && (
            <View style={[styles.dot, { backgroundColor: statusDotColor }]} />
          )}
          <Text style={[styles.value, { color: theme.textSecondary }]}>
            {status}
          </Text>
        </View>
      </View>

      {winningEntry && (
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>
            Winning Entry
          </Text>
          <Text style={[styles.winning, { color: theme.winsBar }]}>
            {winningEntry}
          </Text>
        </View>
      )}

      <Field label="Draw Date & Time" value={dateTime} />

      {link && (
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Links</Text>
          <Pressable
            accessibilityRole="link"
            hitSlop={8}
            onPress={() => Linking.openURL(link.url).catch(() => {})}
          >
            <Text style={[styles.value, styles.link, { color: theme.text }]}>
              {link.label}
            </Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.textSecondary }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  assets: {
    gap: Spacing.three,
  },
  assetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  assetTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  viewAsset: {
    fontSize: 13,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  field: {
    gap: Spacing.two,
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
  label: {
    fontSize: 15,
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
  },
  winning: {
    fontSize: 24,
    fontWeight: "500",
  },
  link: {
    alignSelf: "flex-start",
    textDecorationLine: "underline",
  },
  button: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.85,
  },
});
