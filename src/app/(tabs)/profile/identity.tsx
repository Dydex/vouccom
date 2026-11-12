import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlainHeader } from "@/components/plain-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { USER, type VerificationStatus } from "@/data/user";
import { useTheme } from "@/hooks/use-theme";

/** Exported 4x icons (80x80), shown at 16x16 and tinted. */
function Glyph({ source, color }: { source: number; color: string }) {
  return (
    <Image
      source={source}
      style={styles.glyph}
      contentFit="contain"
      tintColor={color}
    />
  );
}

export default function IdentityVerificationScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const STATUS: Record<
    VerificationStatus,
    { source: number; color: string; label: string }
  > = {
    verified: {
      source: require("@/assets/images/common/Successful.png"),
      color: theme.moneyIn,
      label: "Verified",
    },
    pending: {
      source: require("@/assets/images/common/Pending.png"),
      color: theme.badgeSoon,
      label: "Pending",
    },
    failed: {
      source: require("@/assets/images/common/Failed.png"),
      color: theme.moneyOut,
      label: "Failed",
    },
  };

  const rows: {
    id: string;
    label: string;
    icon: ReactNode;
    status: VerificationStatus;
  }[] = [
    {
      id: "bvn",
      label: "BVN",
      icon: (
        <SymbolView
          name={{ ios: "person", android: "person", web: "person" }}
          tintColor={theme.text}
          size={16}
        />
      ),
      status: USER.bvn,
    },
    {
      id: "nin",
      label: "NIN",
      icon: (
        <Glyph
          source={require("@/assets/images/common/Trusted.png")}
          color={theme.text}
        />
      ),
      status: USER.nin,
    },
    {
      id: "id",
      label: "Government Issued ID",
      icon: (
        <Glyph
          source={require("@/assets/images/profile/Docs.png")}
          color={theme.text}
        />
      ),
      status: USER.governmentId,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PlainHeader title="Identity Verification" fallback="/profile" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              FloatingTabBarHeight + Math.max(insets.bottom, 12) + Spacing.five,
          },
        ]}
      >
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {rows.map((row, i) => {
            const status = STATUS[row.status];
            return (
              <Pressable
                key={row.id}
                accessibilityRole="button"
                accessibilityLabel={`${row.label}, ${status.label}`}
                // TODO: each check needs its own verification flow.
                style={({ pressed }) => [
                  styles.row,
                  i > 0 && {
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: theme.chip,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.icon}>{row.icon}</View>
                <Text style={[styles.label, { color: theme.text }]}>
                  {row.label}
                </Text>
                <Glyph source={status.source} color={status.color} />
                <Image
                  source={require("@/assets/images/common/Arrow Right.png")}
                  style={styles.forward}
                  contentFit="contain"
                  tintColor={theme.text}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Spacing.three + Spacing.one,
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: Spacing.three,
  },
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three - Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    width: 20,
    alignItems: "center",
  },
  glyph: {
    width: 16,
    height: 16,
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
  forward: {
    width: 20,
    height: 20, // Arrow Right.png is a 4x export (80x80)
  },
});
