import type { Href } from "expo-router";
import { router } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/bottom-sheet";
import { Text } from "@/components/text";
import { Spacing } from "@/constants/theme";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";
import { useTheme } from "@/hooks/use-theme";
import type { ApiNotification, NotificationType } from "@/lib/api";
import { timeAgo } from "@/lib/format";

type Theme = ReturnType<typeof useTheme>;

function iconFor(
  type: NotificationType,
  theme: Theme,
): { name: SymbolViewProps["name"]; color: string } {
  switch (type) {
    case "listing_live":
    case "draw_result":
      return {
        name: {
          ios: "play.circle",
          android: "play_circle",
          web: "play_circle",
        },
        color: theme.coral,
      };
    case "wallet_funded":
    case "voucher_purchased":
      return {
        name: {
          ios: "checkmark.circle",
          android: "check_circle",
          web: "check_circle",
        },
        color: theme.moneyIn,
      };
    case "prize_won":
      return {
        name: { ios: "star", android: "star", web: "star" },
        color: theme.badgeSoon,
      };
    default:
      return {
        name: { ios: "person", android: "person", web: "person" },
        color: theme.text,
      };
  }
}

/** Where tapping a notification goes, if anywhere. */
function targetFor(notification: ApiNotification): Href | undefined {
  const listingId = notification.meta?.listingId;
  switch (notification.type) {
    case "listing_live":
    case "draw_result":
    case "voucher_purchased":
      return listingId
        ? { pathname: "/listing/[id]", params: { id: listingId } }
        : "/listings";
    case "wallet_funded":
      return "/wallet";
    case "prize_won":
      return "/home/myWins";
    case "kyc_verified":
      return "/profile/identity";
    default:
      return undefined;
  }
}

type NotificationsSheetProps = {
  visible: boolean;
  onClose: () => void;
};

/** "Notifications" pop-up: unread notifications, and "Clear" to mark them all read. */
export function NotificationsSheet({
  visible,
  onClose,
}: NotificationsSheetProps) {
  const theme = useTheme();
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  // Check for new ones each time the sheet opens.
  const refetch = notifications.refetch;
  useEffect(() => {
    if (visible) refetch();
  }, [visible, refetch]);

  const unread = (notifications.data?.notifications ?? []).filter(
    (n) => !n.read,
  );
  const now = new Date();

  const open = (notification: ApiNotification) => {
    markRead.mutate(notification.id);
    const target = targetFor(notification);
    if (target) {
      onClose();
      router.push(target);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Notifications"
      tall
      footer={
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: unread.length === 0 }}
          disabled={unread.length === 0}
          onPress={() => markAllRead.mutate()}
          style={({ pressed }) => [
            styles.clear,
            { backgroundColor: theme.brand },
            unread.length === 0 && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.clearText, { color: theme.onBrand }]}>
            Clear
          </Text>
        </Pressable>
      }
    >
      {/* One child, so the sheet's own section spacing doesn't apply here. */}
      <View style={styles.list}>
        {notifications.isPending ? (
          <ActivityIndicator style={styles.state} color={theme.brand} />
        ) : notifications.isError && !notifications.data ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => notifications.refetch()}
            style={styles.state}
          >
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              Couldn't load your notifications. Tap to try again.
            </Text>
          </Pressable>
        ) : unread.length === 0 ? (
          <Text
            style={[
              styles.message,
              styles.state,
              { color: theme.textSecondary },
            ]}
          >
            You're all caught up.
          </Text>
        ) : (
          unread.map((notification) => {
            const icon = iconFor(notification.type, theme);
            return (
              <Pressable
                key={notification.id}
                accessibilityRole="button"
                accessibilityHint={notification.body ?? undefined}
                onPress={() => open(notification)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <View style={[styles.icon, { backgroundColor: theme.card }]}>
                  <SymbolView
                    name={icon.name}
                    tintColor={icon.color}
                    size={18}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={[styles.title, { color: theme.text }]}
                >
                  {notification.title}
                </Text>
                <Text style={[styles.time, { color: theme.placeholder }]}>
                  {timeAgo(new Date(notification.createdAt), now)}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  row: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 14,
  },
  time: {
    fontSize: 11,
  },
  state: {
    marginTop: Spacing.five,
    alignSelf: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
  },
  clear: {
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: {
    fontSize: 15,
    fontWeight: "500",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
