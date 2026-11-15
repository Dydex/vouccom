import { useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";

import { notificationsKey } from "@/hooks/use-notifications";
import { targetForPush } from "@/lib/notifications";
import { registerForPush } from "@/lib/push";

/**
 * While signed in: registers this phone for push, keeps the notifications
 * list fresh when one arrives, and opens the right screen when one is tapped.
 */
export function usePushNotifications(signedIn: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!signedIn) return;

    // On every app start, as the backend asks.
    registerForPush();

    // Fetching the token fires this event too, even when it hasn't changed,
    // so only re-register for a different token (or it loops).
    let lastDeviceToken: string | undefined;
    const tokenChanged = Notifications.addPushTokenListener(({ data }) => {
      const token = String(data);
      const changed =
        lastDeviceToken !== undefined && token !== lastDeviceToken;
      lastDeviceToken = token;
      if (changed) registerForPush();
    });

    const refresh = () =>
      queryClient.invalidateQueries({ queryKey: notificationsKey });
    const received = Notifications.addNotificationReceivedListener(refresh);

    const open = (response: Notifications.NotificationResponse) => {
      refresh();
      const target = targetForPush(
        response.notification.request.content.data as
          Record<string, unknown> | undefined,
      );
      if (target) router.push(target);
      // So the same tap isn't handled again next time.
      Notifications.clearLastNotificationResponse();
    };

    // The app was opened by tapping a notification.
    const launch = Notifications.getLastNotificationResponse();
    if (launch) open(launch);
    const tapped = Notifications.addNotificationResponseReceivedListener(open);

    return () => {
      tokenChanged.remove();
      received.remove();
      tapped.remove();
    };
  }, [signedIn, queryClient]);
}
