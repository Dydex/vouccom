import { useMutation } from "@tanstack/react-query";

import {
  updateMe,
  uploadAvatar,
  type LocalFile,
  type ProfileUpdate,
} from "@/lib/api";
import { useAuth } from "@/state/auth";

/** Saves profile changes and shows the server's updated user everywhere. */
export function useUpdateProfile() {
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: (update: ProfileUpdate) => updateMe(update),
    onSuccess: ({ user }) => updateUser(user),
  });
}

/** Uploads a new profile photo. */
export function useUploadAvatar() {
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: (file: LocalFile) => uploadAvatar(file),
    onSuccess: ({ user }) => updateUser(user),
  });
}
