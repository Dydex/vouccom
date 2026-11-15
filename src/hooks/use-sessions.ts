import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSessions, revokeSession, type Session } from "@/lib/api";

export const sessionsKey = ["sessions"] as const;

/** Devices signed in to this account, this one first. */
export function useSessions() {
  return useQuery({
    queryKey: sessionsKey,
    queryFn: getSessions,
    select: (data) =>
      [...data.sessions].sort((a, b) => Number(b.current) - Number(a.current)),
  });
}

/** Signs a device out, removing it from the list straight away. */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => revokeSession(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: sessionsKey });
      const previous = queryClient.getQueryData<{ sessions: Session[] }>(
        sessionsKey,
      );
      queryClient.setQueryData<{ sessions: Session[] }>(
        sessionsKey,
        (old) => old && { sessions: old.sessions.filter((s) => s.id !== id) },
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(sessionsKey, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sessionsKey });
    },
  });
}
