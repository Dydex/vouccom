import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMyWinnings,
  submitClaim,
  uploadClaimDocument,
  type ApiWinning,
  type LocalFile,
} from "@/lib/api";
import { toWin, type Win } from "@/lib/winnings";

export const winningsKey = ["winnings"] as const;

function toWins(data: { winnings: ApiWinning[] }): Win[] {
  const now = Date.now();
  return data.winnings.map((winning) => toWin(winning, now));
}

/** Prizes the signed-in user has won. */
export function useWinnings() {
  return useQuery({
    queryKey: winningsKey,
    queryFn: getMyWinnings,
    select: toWins,
  });
}

/** Uploads both documents, then submits the claim. */
export function useSubmitClaim(winningId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      governmentId,
      proofOfAddress,
    }: {
      governmentId: LocalFile;
      proofOfAddress: LocalFile;
    }) => {
      const [id, address] = await Promise.all([
        uploadClaimDocument(governmentId),
        uploadClaimDocument(proofOfAddress),
      ]);
      return submitClaim(winningId, {
        governmentIdUrl: id.url,
        proofOfAddressUrl: address.url,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: winningsKey });
    },
  });
}
