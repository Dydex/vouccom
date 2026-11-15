import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationsPage,
} from "@/lib/api";

export const notificationsKey = ["notifications"] as const;

/** The latest notifications and how many are unread. */
export function useNotifications() {
  return useQuery({
    queryKey: notificationsKey,
    queryFn: () => getNotifications(),
  });
}

function setRead(
  page: NotificationsPage | undefined,
  isTarget: (id: string) => boolean,
): NotificationsPage | undefined {
  if (!page) return page;
  const notifications = page.notifications.map((n) =>
    isTarget(n.id) ? { ...n, read: true } : n,
  );
  return {
    ...page,
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
  };
}

/** Marks notifications read on screen first, then on the server. */
function useReadMutation<T>(
  send: (target: T) => Promise<unknown>,
  isTarget: (target: T) => (id: string) => boolean,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: send,
    onMutate: async (target: T) => {
      await queryClient.cancelQueries({ queryKey: notificationsKey });
      const previous =
        queryClient.getQueryData<NotificationsPage>(notificationsKey);
      queryClient.setQueryData(
        notificationsKey,
        setRead(previous, isTarget(target)),
      );
      return { previous };
    },
    onError: (_error, _target, context) => {
      queryClient.setQueryData(notificationsKey, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKey });
    },
  });
}

export function useMarkNotificationRead() {
  return useReadMutation(
    (id: string) => markNotificationRead(id),
    (id) => (other) => other === id,
  );
}

export function useMarkAllNotificationsRead() {
  return useReadMutation(
    (_: void) => markAllNotificationsRead(),
    () => () => true,
  );
}
