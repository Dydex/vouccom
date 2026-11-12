import { Image } from "expo-image";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlainHeader } from "@/components/plain-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { CONTACT, SOCIALS } from "@/data/contact";
import { useTheme } from "@/hooks/use-theme";

export default function ContactUsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const open = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PlainHeader title="Contact Us" fallback="/profile" />

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
        <Text style={[styles.heading, { color: theme.text }]}>
          Get in touch
        </Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Email:
          </Text>
          <LinkRow
            text={CONTACT.email}
            label={`Email ${CONTACT.email}`}
            onPress={() => open(`mailto:${CONTACT.email}`)}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Phone:
          </Text>
          <LinkRow
            text={CONTACT.phone}
            label={`Call ${CONTACT.phone}`}
            onPress={() => open(`tel:${CONTACT.phone.replace(/\s/g, "")}`)}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Address:
          </Text>
          <Text style={[styles.address, { color: theme.text }]}>
            {CONTACT.address}
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Follow Us
          </Text>
          <View style={styles.socials}>
            {SOCIALS.map((social) => (
              <Pressable
                key={social.id}
                accessibilityRole="link"
                accessibilityLabel={social.label}
                // TODO: open the real profile once the links are known.
                onPress={() => social.url && open(social.url)}
                style={({ pressed }) => [
                  styles.social,
                  { backgroundColor: theme.text },
                  pressed && styles.pressed,
                ]}
              >
                <Image
                  source={social.icon}
                  style={styles.icon}
                  contentFit="contain"
                  tintColor={theme.background}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function LinkRow({
  text,
  label,
  onPress,
}: {
  text: string;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
    >
      <Text style={[styles.value, { color: theme.text }]}>{text}</Text>
      <Image
        source={require("@/assets/images/common/Arrow Right.png")}
        style={styles.forward}
        contentFit="contain"
        tintColor={theme.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Spacing.three + Spacing.one,
    gap: Spacing.four,
  },
  heading: {
    fontSize: 15,
    fontWeight: "500",
  },
  field: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 12,
  },
  value: {
    fontSize: 15,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two + Spacing.one,
    alignSelf: "flex-start",
  },
  forward: {
    width: 20,
    height: 20, // Arrow Right.png is a 4x export (80x80)
  },
  address: {
    fontSize: 15,
    lineHeight: 22,
  },
  socials: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two + Spacing.one,
  },
  social: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 18,
    height: 18, // a 4x export (80x80), shown at 18x18
  },
  pressed: {
    opacity: 0.7,
  },
});
