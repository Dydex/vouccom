import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlainHeader } from "@/components/plain-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

// TODO: each document needs its own screen (or a link to the page on the website).
const DOCUMENTS = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms of Use" },
];

export default function LegalScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PlainHeader title="Legal" fallback="/profile" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              FloatingTabBarHeight + Math.max(insets.bottom, 12) + Spacing.five,
          },
        ]}
      >
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {DOCUMENTS.map((doc, i) => (
            <Pressable
              key={doc.id}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.row,
                i > 0 && {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: theme.chip,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.label, { color: theme.text }]}>
                {doc.label}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Spacing.three + Spacing.one,
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: Spacing.three,
  },
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
  forward: {
    width: 18,
    height: 14,
    // The back arrow, flipped to point forward.
    transform: [{ scaleX: -1 }],
  },
});
