import { Image } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Text, TextInput } from "@/components/text";

import { BottomSheet } from "@/components/bottom-sheet";
import { Spacing } from "@/constants/theme";
import { useComments, usePostComment } from "@/hooks/use-comments";
import { useTheme } from "@/hooks/use-theme";
import { ApiError } from "@/lib/api";
import { isApiListingId } from "@/lib/listings";

/** How many comments show before "See all". */
const LATEST = 2;

type CommentsSheetProps = {
  listingId: string;
  visible: boolean;
  onClose: () => void;
};

/** "Comments" pop-up: write a comment and read the latest ones. */
export function CommentsSheet({
  listingId,
  visible,
  onClose,
}: CommentsSheetProps) {
  const theme = useTheme();

  // Sample listings have no comments on the server.
  const live = isApiListingId(listingId);
  const query = useComments(listingId, visible && live);
  const post = usePostComment(listingId);

  const [draft, setDraft] = useState("");
  const [showAll, setShowAll] = useState(false);

  const comments = query.data ?? [];
  const canSubmit = live && draft.trim().length > 0 && !post.isPending;
  const shown = showAll ? comments : comments.slice(0, LATEST);
  const hasMore = comments.length > LATEST || query.hasNextPage;

  const submit = () => {
    if (!canSubmit) return;
    post.mutate(draft.trim(), {
      onSuccess: () => setDraft(""),
    });
  };

  return (
    // No fixed height: grows as comments load, up to the sheet's limit, then scrolls.
    <BottomSheet visible={visible} onClose={onClose} title="Comments">
      <View style={styles.compose}>
        <Text style={[styles.label, { color: theme.text }]}>Add a comment</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Add a comment"
          placeholderTextColor={theme.placeholder}
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit }}
          disabled={!canSubmit}
          onPress={submit}
          style={({ pressed }) => [
            styles.submit,
            { backgroundColor: theme.brand },
            !canSubmit && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          {post.isPending ? (
            <ActivityIndicator color={theme.onBrand} />
          ) : (
            <Text style={[styles.submitText, { color: theme.onBrand }]}>
              Submit
            </Text>
          )}
        </Pressable>
        {post.isError && (
          <Text style={[styles.message, { color: theme.coral }]}>
            {post.error instanceof ApiError
              ? post.error.message
              : "Couldn't post your comment."}
          </Text>
        )}
      </View>

      <View style={styles.latest}>
        <View style={styles.latestHeader}>
          <Text style={[styles.latestLabel, { color: theme.textSecondary }]}>
            Latest comments
          </Text>
          {hasMore && (
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowAll((v) => !v)}
              style={[styles.seeAll, { backgroundColor: theme.greyButton }]}
            >
              <Text style={[styles.seeAllText, { color: theme.text }]}>
                {showAll ? "Show less" : "See all"}
              </Text>
              {!showAll && (
                <Image
                  source={require("@/assets/images/common/Arrow Right.png")}
                  style={styles.forwardArrow}
                  contentFit="contain"
                  tintColor={theme.text}
                />
              )}
            </Pressable>
          )}
        </View>

        {query.isPending && live ? (
          <ActivityIndicator style={styles.loading} color={theme.brand} />
        ) : query.isError && comments.length === 0 ? (
          <View style={styles.state}>
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              {query.error instanceof ApiError
                ? query.error.message
                : "Couldn't load the comments."}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => query.refetch()}
              hitSlop={8}
            >
              <Text style={[styles.retryText, { color: theme.brand }]}>
                Try again
              </Text>
            </Pressable>
          </View>
        ) : comments.length === 0 ? (
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            No comments yet. Be the first to ask a question.
          </Text>
        ) : null}

        {shown.map((comment) => (
          <View
            key={comment.id}
            style={[styles.comment, { backgroundColor: theme.card }]}
          >
            <Text style={[styles.author, { color: theme.text }]}>
              {comment.author}
            </Text>
            <Text style={[styles.text, { color: theme.text }]}>
              {comment.text}
            </Text>
            <Text style={[styles.stamp, { color: theme.placeholder }]}>
              {comment.time} · {comment.date}
            </Text>
          </View>
        ))}

        {showAll && query.hasNextPage && (
          <Pressable
            accessibilityRole="button"
            disabled={query.isFetchingNextPage}
            onPress={() => query.fetchNextPage()}
            style={[styles.loadMore, { backgroundColor: theme.greyButton }]}
          >
            {query.isFetchingNextPage ? (
              <ActivityIndicator color={theme.text} />
            ) : (
              <Text style={[styles.seeAllText, { color: theme.text }]}>
                Load more
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  compose: {
    gap: Spacing.three,
    alignItems: "flex-start",
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
  },
  input: {
    alignSelf: "stretch",
    minHeight: 220,
    borderRadius: 24,
    padding: Spacing.three,
    fontSize: 14,
    lineHeight: 20,
  },
  submit: {
    height: 40,
    paddingHorizontal: Spacing.four - Spacing.one,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    fontSize: 14,
    fontWeight: "500",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  state: {
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  retryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  loading: {
    marginVertical: Spacing.three,
  },
  loadMore: {
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  latest: {
    gap: Spacing.three,
  },
  latestHeader: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  latestLabel: {
    fontSize: 14,
  },
  seeAll: {
    height: 40,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  forwardArrow: {
    width: 20,
    height: 20, // Arrow Right.png is a 4x export (80x80)
  },
  seeAllText: {
    fontSize: 14,
  },
  comment: {
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  author: {
    fontSize: 15,
  },
  text: {
    fontSize: 13,
    lineHeight: 19,
  },
  stamp: {
    fontSize: 12,
  },
});
