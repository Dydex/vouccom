import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PhoneIcon } from "@/components/phone-icon";
import { PlainHeader } from "@/components/plain-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import {
  getAppearance,
  setAppearance,
  type AppearancePreference,
} from "@/state/appearance";
import { useTheme } from "@/hooks/use-theme";

export default function AppPreferencesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [appearance, setChoice] = useState<AppearancePreference>(getAppearance);

  const choose = (preference: AppearancePreference) => {
    setChoice(preference);
    setAppearance(preference);
  };

  const options: {
    id: AppearancePreference;
    label: string;
    icon: ReactNode;
  }[] = [
    {
      id: "system",
      label: "System Default",
      icon: <PhoneIcon color={theme.text} />,
    },
    {
      id: "light",
      label: "Light",
      // TODO: use the exported sun icon.
      icon: (
        <SymbolView
          name={{ ios: "sun.max", android: "light_mode", web: "light_mode" }}
          tintColor={theme.text}
          size={16}
        />
      ),
    },
    {
      id: "dark",
      label: "Dark",
      // TODO: use the exported moon icon.
      icon: (
        <SymbolView
          name={{ ios: "moon", android: "dark_mode", web: "dark_mode" }}
          tintColor={theme.text}
          size={16}
        />
      ),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PlainHeader title="App Preferences" fallback="/profile" />

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
        {/* Appearance */}
        <View style={[styles.group, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>Appearance</Text>
          {options.map((option, i) => {
            const selected = appearance === option.id;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => choose(option.id)}
                style={[
                  styles.row,
                  i > 0 && {
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: theme.chip,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: theme.greyButton },
                  ]}
                >
                  {option.icon}
                </View>
                <Text style={[styles.label, { color: theme.text }]}>
                  {option.label}
                </Text>
                <View
                  style={[
                    styles.radio,
                    selected
                      ? {
                          backgroundColor: theme.accent,
                          borderColor: theme.accent,
                        }
                      : { borderColor: theme.chip },
                  ]}
                >
                  {selected && (
                    <SymbolView
                      name={{
                        ios: "checkmark",
                        android: "check",
                        web: "check",
                      }}
                      tintColor="#FFFFFF"
                      weight="bold"
                      size={10}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Language */}
        <View style={[styles.group, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>Language</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>English</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change language"
              // TODO: language picker, once more than English is offered.
              style={[styles.iconCircle, { backgroundColor: theme.greyButton }]}
            >
              <Image
                source={require("@/assets/images/profile/Edit.png")}
                style={styles.edit}
                contentFit="contain"
                tintColor={theme.text}
              />
            </Pressable>
          </View>
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
    gap: Spacing.three,
  },
  group: {
    borderRadius: 24,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.one,
  },
  row: {
    // Padding keeps each divider line clear of the icons above and below.
    paddingVertical: Spacing.two + Spacing.half,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three - Spacing.one,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  edit: {
    width: 16,
    height: 16, // Edit.png is a 4x export (80x80, shown at 16x16)
  },
});
