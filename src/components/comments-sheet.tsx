import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { BottomSheet } from "@/components/bottom-sheet";
import { QuantityBar } from "@/components/quantity-bar";
import { Spacing } from "@/constants/theme";
import { SAMPLE_COMMENTS, stampNow, type Comment } from "@/data/comments";
import { useTheme } from "@/hooks/use-theme";

/** How many comments show before "See all". */
const LATEST = 2;

type CommentsSheetProps = {
  visible: boolean;
  onClose: () => void;
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  unitPrice: number;
  onAdd: () => void;
};

/** "Comments" pop-up: write a comment and read the latest ones. */
export function CommentsSheet({
  visible,
  onClose,
  quantity,
  maxQuantity,
  onQuantityChange,
  unitPrice,
  onAdd,
}: CommentsSheetProps) {
  const theme = useTheme();

  const [comments, setComments] = useState<Comment[]>(SAMPLE_COMMENTS);
  const [draft, setDraft] = useState("");
  const [showAll, setShowAll] = useState(false);

  const canSubmit = draft.trim().length > 0;
  const shown = showAll ? comments : comments.slice(0, LATEST);

  const submit = () => {
    if (!canSubmit) return;
    // TODO: post the comment to the backend and use the signed-in user's name.
    setComments((list) => [
      {
        id: `new-${Date.now()}`,
        author: "You",
        text: draft.trim(),
        ...stampNow(),
      },
      ...list,
    ]);
    setDraft("");
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Comments"
      tall
      footer={
        <QuantityBar
          quantity={quantity}
          maxQuantity={maxQuantity}
          onQuantityChange={onQuantityChange}
          unitPrice={unitPrice}
          onAdd={onAdd}
        />
      }
    >
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
          <Text style={[styles.submitText, { color: theme.onBrand }]}>
            Submit
          </Text>
        </Pressable>
      </View>

      <View style={styles.latest}>
        <View style={styles.latestHeader}>
          <Text style={[styles.latestLabel, { color: theme.textSecondary }]}>
            Latest comments
          </Text>
          {comments.length > LATEST && (
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
                  source={require("@/assets/images/common/backarrow.png")}
                  style={styles.forwardArrow}
                  contentFit="contain"
                  tintColor={theme.text}
                />
              )}
            </Pressable>
          )}
        </View>

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
    width: 18,
    height: 14,
    // The back arrow, flipped to point forward.
    transform: [{ scaleX: -1 }],
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
