import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlainHeader } from "@/components/plain-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { USER } from "@/data/user";
import { useTheme } from "@/hooks/use-theme";

type Field = {
  id: string;
  label: string;
  value: string;
  verified?: boolean;
  action: { label: string; icon: number };
};

const EDIT = {
  label: "Edit",
  icon: require("@/assets/images/profile/Edit.png"),
};

const FIELDS: Field[] = [
  { id: "name", label: "Account name", value: USER.fullName, action: EDIT },
  {
    id: "phone",
    label: "Phone number",
    value: USER.phone,
    verified: USER.phoneVerified,
    action: EDIT,
  },
  {
    id: "email",
    label: "Email",
    value: USER.email,
    verified: USER.emailVerified,
    action: EDIT,
  },
  {
    id: "address",
    label: "Address",
    value: USER.address,
    verified: USER.addressVerified,
    action: EDIT,
  },
  {
    id: "dob",
    label: "Date of birth",
    value: USER.dateOfBirth,
    verified: USER.dateOfBirthVerified,
    action: {
      label: "Change date of birth",
      icon: require("@/assets/images/profile/Date.png"),
    },
  },
  {
    id: "userId",
    label: "User ID",
    value: USER.userId,
    action: {
      label: "Copy user ID",
      icon: require("@/assets/images/profile/Copy.png"),
    },
  },
];

export default function ProfileDetailsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // TODO: every action needs its flow: editing a field, picking a date, and
  // copying the user ID (copying needs the expo-clipboard package).
  const onAction = (_id: string) => {};

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PlainHeader title="Profile Details" fallback="/profile" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom:
              FloatingTabBarHeight + Math.max(insets.bottom, 12) + Spacing.five,
          },
        ]}
      >
        {FIELDS.map((field) => (
          <View
            key={field.id}
            style={[styles.row, { backgroundColor: theme.card }]}
          >
            <View style={styles.text}>
              <Text style={[styles.label, { color: theme.text }]}>
                {field.label}
              </Text>
              <Text
                style={[styles.value, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                {field.value}
              </Text>
            </View>

            {field.verified && (
              <View accessibilityLabel="Verified">
                <Image
                  source={require("@/assets/images/common/Successful.png")}
                  style={styles.check}
                  contentFit="contain"
                  tintColor={theme.moneyIn}
                />
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${field.action.label}: ${field.label}`}
              hitSlop={10}
              onPress={() => onAction(field.id)}
            >
              <Image
                source={field.action.icon}
                style={styles.actionIcon}
                contentFit="contain"
                tintColor={theme.text}
              />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: Spacing.three + Spacing.one,
    gap: Spacing.two,
  },
  row: {
    minHeight: 58,
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three - Spacing.one,
  },
  check: {
    width: 16,
    height: 16,
  },
  actionIcon: {
    width: 18,
    height: 18,
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  value: {
    fontSize: 12,
  },
});
