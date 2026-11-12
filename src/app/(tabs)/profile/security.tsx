import { Image } from "expo-image";
import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlainHeader } from "@/components/plain-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

/** Exported 4x icons (80x80), shown at 18x18 and tinted. */
function Glyph({ source, color }: { source: number; color: string }) {
  return (
    <Image
      source={source}
      style={styles.glyph}
      contentFit="contain"
      tintColor={color}
    />
  );
}

export default function SecurityPrivacyScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Both start on. TODO: load and save these on the backend, and ask for the
  // phone's face or fingerprint check before turning biometric login on.
  const [biometric, setBiometric] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);

  const rows: (
    | {
        id: string;
        label: string;
        icon: ReactNode;
        kind: "link";
        onPress: () => void;
      }
    | {
        id: string;
        label: string;
        icon: ReactNode;
        kind: "switch";
        value: boolean;
        onChange: (value: boolean) => void;
      }
  )[] = [
    {
      id: "password",
      label: "Change password",
      icon: (
        <Glyph
          source={require("@/assets/images/common/Secure.png")}
          color={theme.text}
        />
      ),
      kind: "link",
      // Opens the same screen as "forgot password" for now.
      onPress: () => router.push("/changePassword"),
    },
    {
      id: "biometric",
      label: "Biometric Login",
      icon: (
        <Glyph
          source={require("@/assets/images/profile/FaceID.png")}
          color={theme.text}
        />
      ),
      kind: "switch",
      value: biometric,
      onChange: setBiometric,
    },
    {
      id: "2fa",
      label: "Two Factor Authentication",
      icon: (
        <Glyph
          source={require("@/assets/images/profile/TwoFactor.png")}
          color={theme.text}
        />
      ),
      kind: "switch",
      value: twoFactor,
      onChange: setTwoFactor,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PlainHeader title="Security & Privacy" fallback="/profile" />

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
        <View style={[styles.group, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>Security</Text>

          {rows.map((row, i) => {
            const content = (
              <>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: theme.greyButton },
                  ]}
                >
                  {row.icon}
                </View>
                <Text style={[styles.label, { color: theme.text }]}>
                  {row.label}
                </Text>
                {row.kind === "switch" ? (
                  <Switch
                    accessibilityLabel={row.label}
                    value={row.value}
                    onValueChange={row.onChange}
                    trackColor={{ false: theme.chip, true: theme.accent }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor={theme.chip}
                    style={styles.switch}
                  />
                ) : (
                  <Image
                    source={require("@/assets/images/common/Arrow Right.png")}
                    style={styles.forward}
                    contentFit="contain"
                    tintColor={theme.text}
                  />
                )}
              </>
            );

            const rowStyle = [
              styles.row,
              i > 0 && {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: theme.chip,
              },
            ];

            return row.kind === "link" ? (
              <Pressable
                key={row.id}
                accessibilityRole="button"
                onPress={row.onPress}
                style={({ pressed }) => [rowStyle, pressed && styles.pressed]}
              >
                {content}
              </Pressable>
            ) : (
              <View key={row.id} style={rowStyle}>
                {content}
              </View>
            );
          })}
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
    // Padding keeps each divider line clear of the icons and switches around it.
    paddingVertical: Spacing.two + Spacing.half,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three - Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: {
    width: 18,
    height: 18,
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
  switch: {
    transform: [{ scale: 0.85 }],
  },
  forward: {
    width: 20,
    height: 20, // Arrow Right.png is a 4x export (80x80)
  },
});
