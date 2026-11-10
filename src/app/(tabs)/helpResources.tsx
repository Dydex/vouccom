import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchField } from "@/components/list-controls";
import { ListHeader } from "@/components/list-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { COLLAPSED_COUNT, HELP_CATEGORIES, type HelpTone } from "@/data/help";
import { useTheme } from "@/hooks/use-theme";

export default function HelpResourcesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Partial<Record<HelpTone, boolean>>>(
    {},
  );

  const tones: Record<HelpTone, { bar: string; pill: string }> = {
    howTos: { bar: theme.winRow, pill: theme.howTosPill },
    vouchers: { bar: theme.browseBar, pill: theme.viewAllPill },
    draws: { bar: theme.drawsBar, pill: theme.drawsPill },
    entries: { bar: theme.entriesBar, pill: theme.entriesPill },
  };

  // Searching narrows every group to the questions that match, and hides empty ones.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HELP_CATEGORIES.map((c) => ({
      ...c,
      questions: q
        ? c.questions.filter((text) => text.toLowerCase().includes(q))
        : c.questions,
    })).filter((c) => c.questions.length > 0);
  }, [query]);

  const searching = query.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ListHeader
        title="Help resources"
        backgroundColor={theme.brand}
        // White text and status-bar icons on the blue band, in both themes.
        statusBarStyle="light"
        contentColor={theme.onBrand}
        backFallback="/helpCentre"
        // TODO: add the header illustration once it is exported.
      >
        <View style={styles.search}>
          <SearchField
            placeholder="Search resources..."
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </ListHeader>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Spacing.one,
          paddingBottom:
            FloatingTabBarHeight + Math.max(insets.bottom, 12) + Spacing.five,
        }}
      >
        {groups.length === 0 && (
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            No resources found
          </Text>
        )}

        {groups.map((group) => {
          const open = searching || expanded[group.id];
          const shown = open
            ? group.questions
            : group.questions.slice(0, COLLAPSED_COUNT);
          const canToggle =
            !searching && group.questions.length > COLLAPSED_COUNT;

          return (
            <View key={group.id}>
              <View
                style={[styles.bar, { backgroundColor: tones[group.id].bar }]}
              >
                <Text style={[styles.barTitle, { color: theme.text }]}>
                  {group.title}
                </Text>
                {canToggle && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: !!open }}
                    accessibilityLabel={`${open ? "Show fewer" : "View all"}: ${group.title}`}
                    onPress={() =>
                      setExpanded((s) => ({ ...s, [group.id]: !s[group.id] }))
                    }
                    style={[
                      styles.pill,
                      { backgroundColor: tones[group.id].pill },
                    ]}
                  >
                    <Text style={[styles.pillText, { color: theme.text }]}>
                      {open ? "show less" : "view all"}
                    </Text>
                    <SymbolView
                      name={
                        open
                          ? {
                              ios: "chevron.up",
                              android: "keyboard_arrow_up",
                              web: "keyboard_arrow_up",
                            }
                          : {
                              ios: "chevron.down",
                              android: "keyboard_arrow_down",
                              web: "keyboard_arrow_down",
                            }
                      }
                      tintColor={theme.text}
                      weight="bold"
                      size={12}
                    />
                  </Pressable>
                )}
              </View>

              <View style={[styles.card, { backgroundColor: theme.card }]}>
                {shown.map((question, i) => (
                  <Pressable
                    key={question}
                    accessibilityRole="button"
                    // TODO: open the article for this question.
                    style={({ pressed }) => [
                      styles.row,
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
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  search: {
    marginTop: Spacing.three,
  },
  empty: {
    marginTop: Spacing.five,
    textAlign: "center",
    fontSize: 14,
  },
  bar: {
    marginTop: Spacing.three,
    marginBottom: Spacing.two + Spacing.one,
    marginHorizontal: 20,
    height: 56,
    borderRadius: 28,
    paddingLeft: Spacing.three + Spacing.one,
    paddingRight: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  barTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  pill: {
    height: 38,
    paddingHorizontal: Spacing.three,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "500",
  },
  card: {
    marginHorizontal: 20,
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
});
