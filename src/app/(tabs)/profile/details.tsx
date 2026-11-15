import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  EditProfileSheet,
  type ProfileSection,
} from "@/components/edit-profile-sheet";
import { PlainHeader } from "@/components/plain-header";
import { useToast } from "@/components/toast";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatCalendarDate } from "@/lib/dates";
import { useAuth } from "@/state/auth";

type Field = {
  id: string;
  label: string;
  value: string;
  verified?: boolean;
  action?: { label: string; icon: number; onPress: () => void };
};

const EDIT_ICON = require("@/assets/images/profile/Edit.png");

export default function ProfileDetailsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { user } = useAuth();
  const [editing, setEditing] = useState<ProfileSection>("name");
  const [editOpen, setEditOpen] = useState(false);

  const edit = (section: ProfileSection) => {
    setEditing(section);
    setEditOpen(true);
  };

  const p = user?.profile;
  const address = [p?.address, p?.city, p?.country].filter(Boolean).join(", ");
  // A verified NIN confirmed the date of birth, so it can't change after.
  const identityVerified = user?.kyc?.status === "verified";

  const fields: Field[] = [
    {
      id: "name",
      label: "Account name",
      value: p ? `${p.firstName} ${p.lastName}` : "...",
      action: { label: "Edit", icon: EDIT_ICON, onPress: () => edit("name") },
    },
    {
      id: "phone",
      label: "Phone number",
      value: user?.phone ?? "Not added",
      verified: !!user?.phoneVerifiedAt,
      // The API can add a phone or verify it, but not change a verified one.
      action:
        user && !user.phoneVerifiedAt
          ? {
              label: user.phone ? "Verify phone number" : "Add phone number",
              icon: EDIT_ICON,
              onPress: () => router.push("/profile/phone"),
            }
          : undefined,
    },
    {
      id: "email",
      label: "Email",
      value: user?.email ?? "...",
      verified: !!user?.emailVerifiedAt,
      // The API can't change the email, only verify it.
      action:
        user && !user.emailVerifiedAt
          ? {
              label: "Verify email",
              icon: EDIT_ICON,
              onPress: () =>
                router.push({
                  pathname: "/verifyEmail",
                  params: { email: user.email, from: "reminder" },
                }),
            }
          : undefined,
    },
    {
      id: "address",
      label: "Address",
      value: address || "Not added",
      action: {
        label: "Edit",
        icon: EDIT_ICON,
        onPress: () => edit("address"),
      },
    },
    {
      id: "dob",
      label: "Date of birth",
      value: formatCalendarDate(p?.dateOfBirth) ?? "Not added",
      verified: identityVerified,
      action: identityVerified
        ? undefined
        : {
            label: "Change date of birth",
            icon: require("@/assets/images/profile/Date.png"),
            onPress: () => edit("dob"),
          },
    },
    {
      id: "userId",
      label: "User ID",
      value: user?.id ?? "...",
      action: user
        ? {
            label: "Copy user ID",
            icon: require("@/assets/images/profile/Copy.png"),
            onPress: async () => {
              await Clipboard.setStringAsync(user.id);
              toast.show({ tone: "success", message: "User ID copied." });
            },
          }
        : undefined,
    },
  ];

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
        {fields.map((field) => (
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
            {field.action && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${field.action.label}: ${field.label}`}
                hitSlop={10}
                onPress={field.action.onPress}
              >
                <Image
                  source={field.action.icon}
                  style={styles.actionIcon}
                  contentFit="contain"
                  tintColor={theme.text}
                />
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>

      <EditProfileSheet
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        section={editing}
        user={user}
      />
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
