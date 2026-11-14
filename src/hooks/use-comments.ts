import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import { toComment, type Comment } from "@/data/comments";
import { getComments, postComment, type CommentsPage } from "@/lib/api";

const PAGE_SIZE = 20;

const commentsKey = (listingId: string) =>
  ["listing", listingId, "comments"] as const;

function toComments(data: InfiniteData<CommentsPage>): Comment[] {
  const seen = new Set<string>();
  const comments: Comment[] = [];
  for (const page of data.pages) {
    for (const api of page.comments) {
      // A new comment shifts the pages, so one can appear twice.
      if (seen.has(api.id)) continue;
      seen.add(api.id);
      comments.push(toComment(api));
    }
  }
  return comments;
}

/** A listing's comments, a page at a time. Only fetches while `enabled`. */
export function useComments(listingId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: commentsKey(listingId),
    queryFn: ({ pageParam }) => getComments(listingId, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.pages ? last.page + 1 : undefined,
    select: toComments,
    enabled,
  });
}

/** Posts a comment and puts it at the top of the list. */
export function usePostComment(listingId: string) {
  const queryClient = useQueryClient();
  const key = commentsKey(listingId);

  return useMutation({
    mutationFn: (body: string) => postComment(listingId, body),
    onSuccess: ({ comment }) => {
      const cached = queryClient.getQueryData<InfiniteData<CommentsPage>>(key);
      if (!cached) {
        queryClient.invalidateQueries({ queryKey: key });
        return;
      }
      queryClient.setQueryData<InfiniteData<CommentsPage>>(key, {
        ...cached,
        pages: cached.pages.map((page, i) =>
          i === 0
            ? {
                ...page,
                comments: [comment, ...page.comments],
                total: page.total + 1,
              }
            : page,
        ),
      });
    },
  });
}
