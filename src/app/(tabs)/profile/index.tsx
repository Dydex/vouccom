import Constants from "expo-constants";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import type { ReactNode } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/avatar";
import { PhoneIcon } from "@/components/phone-icon";
import { useToast } from "@/components/toast";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { USER } from "@/data/user";
import { useUploadAvatar } from "@/hooks/use-profile";
import { useTheme } from "@/hooks/use-theme";
import { ApiError, MAX_AVATAR_BYTES } from "@/lib/api";
import { useAuth } from "@/state/auth";

const SIDE = 20;

type Row = {
  id: string;
  label: string;
  /** A system symbol, or `render` for an icon that is drawn by hand. */
  icon?: SymbolViewProps["name"];
  render?: (color: string) => ReactNode;
  /** Pink icon for actions that end or remove something. */
  danger?: boolean;
};

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: "Personal",
    rows: [
      {
        id: "profile",
        label: "Profile Details",
        icon: { ios: "person", android: "person", web: "person" },
      },
      {
        id: "identity",
        label: "Identity Verification",
        render: (color) => (
          <RowImage
            source={require("@/assets/images/common/Trusted.png")}
            color={color}
          />
        ),
      },
    ],
  },
  {
    title: "Preferences",
    rows: [
      {
        id: "notifications",
        label: "Notifications",
        icon: { ios: "bell", android: "notifications", web: "notifications" },
      },
      {
        id: "app",
        label: "App Preferences",
        render: (color) => <PhoneIcon color={color} />,
      },
      {
        id: "security",
        label: "Security & Privacy",
        render: (color) => (
          <RowImage
            source={require("@/assets/images/common/Secure.png")}
            color={color}
          />
        ),
      },
    ],
  },
  {
    title: "Help & Support",
    rows: [
      {
        id: "help",
        label: "Help Centre",
        icon: { ios: "questionmark.circle", android: "help", web: "help" },
      },
      {
        id: "contact",
        label: "Contact Us",
        render: (color) => (
          <RowImage
            source={require("@/assets/images/profile/Messages.png")}
            color={color}
          />
        ),
      },
      {
        id: "legal",
        label: "Legal",
        render: (color) => (
          <RowImage
            source={require("@/assets/images/profile/Legal.png")}
            color={color}
          />
        ),
      },
    ],
  },
  {
    title: "Others",
    rows: [
      {
        id: "update",
        label: "Check for Update",
        icon: {
          ios: "arrow.triangle.2.circlepath",
          android: "sync",
          web: "sync",
        },
      },
      {
        id: "logout",
        label: "Log Out",
        icon: {
          ios: "rectangle.portrait.and.arrow.right",
          android: "logout",
          web: "logout",
        },
        danger: true,
      },
      {
        id: "delete",
        label: "Delete/Deactivate Account",
        icon: { ios: "trash", android: "delete", web: "delete" },
        danger: true,
      },
    ],
  },
];

/** An exported 4x icon (80x80), shown at 18x18 and tinted. */
function RowImage({ source, color }: { source: number; color: string }) {
  return (
    <Image
      source={source}
      style={styles.rowImage}
      contentFit="contain"
      tintColor={color}
    />
  );
}

function confirmLogOut(signOut: () => Promise<void>) {
  Alert.alert("Log out", "Are you sure you want to log out?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Log out",
      style: "destructive",
      // The protected routes redirect to /login once signed out.
      onPress: () => signOut(),
    },
  ]);
}

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const toast = useToast();
  const avatar = useUploadAvatar();

  const changePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // A square crop, since the photo shows in a circle.
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.fileSize !== undefined && asset.fileSize > MAX_AVATAR_BYTES) {
      toast.show({
        tone: "error",
        message: "That photo is larger than 5MB. Please choose a smaller one.",
      });
      return;
    }
    avatar.mutate(
      {
        uri: asset.uri,
        name: asset.fileName ?? "avatar.jpg",
        mimeType: asset.mimeType ?? "image/jpeg",
      },
      {
        onSuccess: () =>
          toast.show({ tone: "success", message: "Profile photo updated." }),
        onError: (error) =>
          toast.show({
            tone: "error",
            message:
              error instanceof ApiError
                ? error.message
                : "Couldn't upload your photo. Please try again.",
          }),
      },
    );
  };
  // Falls back to sample data until the user has loaded.
  const firstName = user?.profile.firstName ?? USER.firstName;
  const fullName = user
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : USER.fullName;
  const insets = useSafeAreaInsets();

  const onPress = (id: string) => {
    if (id === "profile") router.push("/profile/details");
    if (id === "identity") router.push("/profile/identity");
    if (id === "notifications") router.push("/profile/notifications");
    if (id === "app") router.push("/profile/preferences");
    if (id === "security") router.push("/profile/security");
    if (id === "help") router.push("/profile/help");
    if (id === "contact") router.push("/profile/contact");
    if (id === "legal") router.push("/profile/legal");
    if (id === "logout") confirmLogOut(signOut);
    // TODO: every other row needs its own screen.
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.five,
          paddingBottom:
            FloatingTabBarHeight + Math.max(insets.bottom, 12) + Spacing.five,
        }}
      >
        {/* Who you are */}
        <View style={styles.identity}>
          <View>
            <Avatar
              size={92}
              name={firstName}
              url={user?.profile.avatarUrl}
              loading={avatar.isPending}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              disabled={avatar.isPending}
              onPress={changePhoto}
              style={[styles.editBadge, { backgroundColor: theme.menu }]}
            >
              <SymbolView
                name={{ ios: "pencil", android: "edit", web: "edit" }}
                tintColor={theme.text}
                size={12}
              />
            </Pressable>
          </View>

          <Text style={[styles.name, { color: theme.text }]}>{fullName}</Text>
          {USER.verified && (
            <View
              style={[styles.chip, { backgroundColor: `${theme.moneyIn}26` }]}
            >
              <Text style={[styles.chipText, { color: theme.moneyIn }]}>
                Verified
              </Text>
            </View>
          )}
        </View>

        {/* Settings groups */}
        {SECTIONS.map((section) => (
          <View
            key={section.title}
            style={[styles.group, { backgroundColor: theme.card }]}
          >
            <Text style={[styles.groupTitle, { color: theme.text }]}>
              {section.title}
            </Text>
            {section.rows.map((row, i) => (
              <Pressable
                key={row.id}
                accessibilityRole="button"
                onPress={() => onPress(row.id)}
                style={({ pressed }) => [
                  styles.row,
                  i > 0 && {
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: theme.chip,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.icon,
                    {
                      backgroundColor: row.danger
                        ? theme.moneyOutBg
                        : theme.greyButton,
                    },
                  ]}
                >
                  {row.render ? (
                    row.render(row.danger ? theme.moneyOut : theme.text)
                  ) : (
                    <SymbolView
                      name={row.icon!}
                      tintColor={row.danger ? theme.moneyOut : theme.text}
                      size={16}
                    />
                  )}
                </View>
                <Text style={[styles.label, { color: theme.text }]}>
                  {row.label}
                </Text>
                <Image
                  source={require("@/assets/images/common/Arrow Right.png")}
                  style={styles.forward}
                  contentFit="contain"
                  tintColor={theme.text}
                />
              </Pressable>
            ))}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Built with a mission to get you closer to high value assets
          </Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Version {Constants.expoConfig?.version ?? "0.0.1"}
          </Text>
          {/* TODO: use the exported wordmark; this is the mark with the name typed beside it. */}
          <View style={styles.wordmark}>
            <Image
              source={require("@/assets/images/onboarding/logo.png")}
              style={styles.mark}
              contentFit="contain"
              tintColor={theme.textSecondary}
            />
            <Text style={[styles.wordmarkText, { color: theme.textSecondary }]}>
              vouccom
            </Text>
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
  identity: {
    alignItems: "center",
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  editBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "500",
  },
  chip: {
    height: 24,
    paddingHorizontal: Spacing.three - Spacing.one,
    borderRadius: 12,
    justifyContent: "center",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
  },
  group: {
    marginHorizontal: SIDE,
    marginBottom: Spacing.three,
    borderRadius: 24,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.two,
  },
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three - Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
  rowImage: {
    width: 18,
    height: 18,
  },
  icon: {
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
  forward: {
    width: 20,
    height: 20,
  },
  footer: {
    alignItems: "center",
    gap: Spacing.one,
    paddingTop: Spacing.three,
  },
  tagline: {
    fontSize: 11,
  },
  wordmark: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one + Spacing.half,
    marginTop: Spacing.three,
  },
  mark: {
    width: 16,
    height: 14,
  },
  wordmarkText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
