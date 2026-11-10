import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MessagesSheet } from "@/components/messages-sheet";
import { PlainHeader } from "@/components/plain-header";
import { SectionBar } from "@/components/section-bar";
import { TransactionRow } from "@/components/transaction-row";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { SAMPLE_MESSAGES } from "@/data/support";
import { TRANSACTIONS } from "@/data/wallet";
import { useTheme } from "@/hooks/use-theme";

// TODO: replace with the questions from the help centre.
const FAQS = [
  "How do I fund my wallet?",
  "How do I delete my saved card?",
  "What is Service Fee?",
];

export default function HelpCentreScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // TODO: show the messages for the transaction that was tapped.
  const [messagesOpen, setMessagesOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PlainHeader title="Help Centre" fallback="/profile" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Spacing.three + Spacing.one,
          paddingBottom:
            FloatingTabBarHeight + Math.max(insets.bottom, 12) + Spacing.five,
        }}
      >
        {/* Recent purchases */}
        <Text style={[styles.heading, { color: theme.text }]}>
          Need help with a recent purchase?
        </Text>
        <View style={styles.list}>
          {TRANSACTIONS.slice(0, 2).map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              onPress={() => setMessagesOpen(true)}
            />
          ))}
        </View>

        {/* Questions */}
        <SectionBar
          title="Browse our help center"
          barColor={theme.card}
          pillColor={theme.greyButton}
          pillTextColor={theme.text}
          actionLabel="view all"
          // TODO: open the full list of help articles.
        />
        <View style={[styles.faqs, { backgroundColor: theme.card }]}>
          {FAQS.map((question, i) => (
            <Pressable
              key={question}
              accessibilityRole="button"
              // TODO: open the article for this question.
              style={({ pressed }) => [
                styles.faq,
                i > 0 && {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: theme.chip,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.question, { color: theme.text }]}>
                {question}
              </Text>
              <Image
                source={require("@/assets/images/common/backarrow.png")}
                style={styles.forward}
                contentFit="contain"
                tintColor={theme.text}
              />
            </Pressable>
          ))}
        </View>

        {/* Still stuck */}
        <View style={[styles.banner, { backgroundColor: theme.brand }]}>
          <Text style={[styles.bannerText, { color: theme.onBrand }]}>
            Still need help?
          </Text>
          <Pressable
            accessibilityRole="button"
            // TODO: open support (chat, email or phone) once the app has one.
            style={({ pressed }) => [
              styles.support,
              { backgroundColor: theme.balanceButton },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.supportText, { color: theme.onBrand }]}>
              Contact Support
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <MessagesSheet
        visible={messagesOpen}
        onClose={() => setMessagesOpen(false)}
        messages={SAMPLE_MESSAGES}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    marginHorizontal: 20,
    marginBottom: Spacing.three,
    fontSize: 15,
    fontWeight: "500",
  },
  list: {
    marginHorizontal: 20,
    gap: Spacing.two,
  },
  faqs: {
    marginHorizontal: 20,
    borderRadius: 24,
    paddingHorizontal: Spacing.three,
  },
  faq: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  question: {
    flex: 1,
    fontSize: 14,
  },
  forward: {
    width: 18,
    height: 14,
    // The back arrow, flipped to point forward.
    transform: [{ scaleX: -1 }],
  },
  pressed: {
    opacity: 0.7,
  },
  banner: {
    marginHorizontal: 20,
    marginTop: Spacing.four,
    minHeight: 64,
    borderRadius: 32,
    paddingLeft: Spacing.four - Spacing.one,
    paddingRight: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  bannerText: {
    fontSize: 15,
    fontWeight: "500",
  },
  support: {
    height: 48,
    paddingHorizontal: Spacing.four - Spacing.one,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  supportText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
