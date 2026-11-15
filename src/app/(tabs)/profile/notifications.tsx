import { ScrollView, StyleSheet, Switch, View } from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlainHeader } from "@/components/plain-header";
import { useToast } from "@/components/toast";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { useUpdateProfile } from "@/hooks/use-profile";
import { useTheme } from "@/hooks/use-theme";
import { ApiError, type NotificationPrefs } from "@/lib/api";
import { useAuth } from "@/state/auth";

// The preferences the server stores. TODO: the design has more switches
// (entry updates, wallet activity and others) that the API can't save yet.
const GROUPS: {
  title: string;
  items: { key: keyof NotificationPrefs; label: string }[];
}[] = [
  {
    title: "Draws & Entries",
    items: [
      { key: "drawReminders", label: "Draw reminders" },
      { key: "winnerAnnouncements", label: "Winner announcements" },
    ],
  },
  {
    title: "How we reach you",
    items: [
      { key: "email", label: "Email notifications" },
      { key: "sms", label: "SMS notifications" },
    ],
  },
  {
    title: "Marketing & Promotions",
    items: [{ key: "promotional", label: "Promotions & offers" }],
  },
];

export default function NotificationsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { user, updateUser } = useAuth();
  const save = useUpdateProfile();

  const prefs = user?.notificationPrefs;

  // Flip the switch straight away; put it back if saving fails.
  const toggle = (key: keyof NotificationPrefs, value: boolean) => {
    if (!user || !prefs) return;
    const before = user;
    updateUser({ ...user, notificationPrefs: { ...prefs, [key]: value } });
    save.mutate(
      { notificationPrefs: { [key]: value } },
      {
        onError: (error) => {
          updateUser(before);
          toast.show({
            tone: "error",
            message:
              error instanceof ApiError
                ? error.message
                : "Couldn't save that change. Please try again.",
          });
        },
      },
    );
  };

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
                key={item.key}
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
                  value={prefs?.[item.key] ?? false}
                  disabled={!prefs}
                  onValueChange={(value) => toggle(item.key, value)}
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
