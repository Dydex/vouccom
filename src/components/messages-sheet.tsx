import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";

import { BottomSheet } from "@/components/bottom-sheet";
import { Spacing } from "@/constants/theme";
import type { SupportMessage } from "@/data/support";
import { useTheme } from "@/hooks/use-theme";

type MessagesSheetProps = {
  visible: boolean;
  onClose: () => void;
  messages: SupportMessage[];
  onViewMessage?: (message: SupportMessage) => void;
  onSendNew?: () => void;
};

/** "Messages" pop-up: the support conversations about a purchase, and a way to start another. */
export function MessagesSheet({
  visible,
  onClose,
  messages,
  onViewMessage,
  onSendNew,
}: MessagesSheetProps) {
  const theme = useTheme();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Messages"
      tall
      footer={
        <Pressable
          accessibilityRole="button"
          // TODO: open a form to write a new support message.
          onPress={onSendNew}
          style={({ pressed }) => [
            styles.send,
            { backgroundColor: theme.brand },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.sendText, { color: theme.onBrand }]}>
            Send a new message
          </Text>
        </Pressable>
      }
    >
      {/* One child, so the sheet's own section spacing doesn't apply here. */}
      <View style={styles.list}>
        {messages.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            No messages yet
          </Text>
        ) : (
          messages.map((message) => (
            <Pressable
              key={message.id}
              accessibilityRole="button"
              accessibilityLabel={`${message.subject}, ${message.status}, ${message.age}. View`}
              // TODO: open the conversation once that screen exists.
              onPress={() => onViewMessage?.(message)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: theme.card },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.subject, { color: theme.text }]}>
                {message.subject}
              </Text>
              <View style={styles.metaRow}>
                <Text style={[styles.meta, { color: theme.textSecondary }]}>
                  {message.status} · {message.age}
                </Text>
                <Text style={[styles.meta, { color: theme.textSecondary }]}>
                  View
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  card: {
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    gap: Spacing.one,
  },
  subject: {
    fontSize: 14,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  meta: {
    fontSize: 11,
  },
  empty: {
    textAlign: "center",
    fontSize: 14,
    paddingTop: Spacing.four,
  },
  send: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: {
    fontSize: 15,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.85,
  },
});
