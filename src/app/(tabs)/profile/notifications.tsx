import { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlainHeader } from "@/components/plain-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const GROUPS: { title: string; items: { id: string; label: string }[] }[] = [
  {
    title: "Draws & Entries",
    items: [
      { id: "draw-reminders", label: "Draw reminders" },
      { id: "draw-results", label: "Draw results" },
      { id: "entry-updates", label: "Entry updates" },
    ],
  },
  {
    title: "Wallets & Transactions",
    items: [
      { id: "wallet-activity", label: "Wallet activity" },
      { id: "purchases", label: "Purchase notifications" },
      { id: "withdrawals", label: "Withdrawal updates" },
    ],
  },
  {
    title: "Account & Vouccom",
    items: [
      { id: "account-security", label: "Account & security" },
      { id: "promotions", label: "Promotions & offers" },
    ],
  },
  {
    title: "Marketing & Promotions",
    items: [
      { id: "promo-emails", label: "Promotional emails" },
      { id: "promo-push", label: "Promotional push notifications" },
      { id: "announcements", label: "Special offers and announcements" },
    ],
  },
];

export default function NotificationsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Everything starts on. TODO: load and save these on the backend.
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GROUPS.flatMap((g) => g.items.map((i) => [i.id, true]))),
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PlainHeader title="Notifications" fallback="/profile" />

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
        {GROUPS.map((group) => (
          <View
            key={group.title}
            style={[styles.group, { backgroundColor: theme.card }]}
          >
            <Text style={[styles.title, { color: theme.text }]}>
              {group.title}
            </Text>
            {group.items.map((item, i) => (
              <View
                key={item.id}
                style={[
                  styles.row,
                  i > 0 && {
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: theme.chip,
                  },
                ]}
              >
                <Text style={[styles.label, { color: theme.text }]}>
                  {item.label}
                </Text>
                <Switch
                  accessibilityLabel={item.label}
                  value={enabled[item.id]}
                  onValueChange={(value) =>
                    setEnabled((s) => ({ ...s, [item.id]: value }))
                  }
                  trackColor={{ false: theme.chip, true: theme.accent }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={theme.chip}
                  // A little smaller than the default, as in the design.
                  style={styles.switch}
                />
              </View>
            ))}
          </View>
        ))}
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
    gap: Spacing.three,
  },
  group: {
    borderRadius: 24,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.one,
  },
  row: {
    // Vertical padding keeps each divider line clear of the switches above and below.
    paddingVertical: Spacing.two + Spacing.half,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  switch: {
    transform: [{ scale: 0.85 }],
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
});
