import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getKycStatus, verifyNin, type Kyc } from "@/lib/api";

export const kycKey = ["kyc"] as const;

/** The signed-in user's identity verification. */
export function useKyc() {
  return useQuery({
    queryKey: kycKey,
    queryFn: async () => (await getKycStatus()).kyc,
  });
}

/** Sends the NIN check and stores the new verification state. */
export function useVerifyNin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyNin,
    onSuccess: ({ kyc }) => {
      queryClient.setQueryData<Kyc>(kycKey, kyc);
    },
  });
}
