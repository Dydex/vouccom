import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlainHeader } from "@/components/plain-header";
import { Text } from "@/components/text";
import { useToast } from "@/components/toast";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { useRevokeSession, useSessions } from "@/hooks/use-sessions";
import { useTheme } from "@/hooks/use-theme";
import { ApiError, type Session } from "@/lib/api";
import { describeDevice } from "@/lib/devices";
import { timeAgo } from "@/lib/format";
import { useAuth } from "@/state/auth";

/** Signed-in devices: sign one out, or every device at once. */
export default function DevicesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { signOutEverywhere } = useAuth();
  const sessions = useSessions();
  const revoke = useRevokeSession();
  const [refreshing, setRefreshing] = useState(false);
  const [endingAll, setEndingAll] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await sessions.refetch();
    setRefreshing(false);
  };

  const showError = (error: Error, fallback: string) =>
    toast.show({
      tone: "error",
      message: error instanceof ApiError ? error.message : fallback,
    });

  const confirmRevoke = (session: Session, name: string) =>
    Alert.alert(
      "Sign out this device?",
      `${name} will need to sign in again.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: () =>
            revoke.mutate(session.id, {
              onError: (error) =>
                showError(error, "Couldn't sign that device out."),
            }),
        },
      ],
    );

  const confirmSignOutAll = () =>
    Alert.alert(
      "Sign out of all devices?",
      "Every device, including this one, will need to sign in again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out all",
          style: "destructive",
          onPress: async () => {
            setEndingAll(true);
            try {
              // Signed out here too, so the app returns to the login screen.
              await signOutEverywhere();
            } catch (error) {
              setEndingAll(false);
              showError(
                error as Error,
                "Couldn't sign out of all devices. Please try again.",
              );
            }
          },
        },
      ],
    );

  const now = new Date();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PlainHeader title="Signed-in devices" fallback="/profile/security" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.brand}
          />
        }
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              FloatingTabBarHeight + Math.max(insets.bottom, 12) + Spacing.five,
          },
        ]}
      >
        <Text style={[styles.intro, { color: theme.textSecondary }]}>
          These devices are signed in to your account. Sign out any you don't
          recognise.
        </Text>

        {sessions.isPending ? (
          <ActivityIndicator style={styles.loading} color={theme.brand} />
        ) : sessions.isError && !sessions.data ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => sessions.refetch()}
          >
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              Couldn't load your devices. Tap to try again.
            </Text>
          </Pressable>
        ) : (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {sessions.data?.map((session, i) => {
              const device = describeDevice(session.userAgent);
              const meta = [
                session.current
                  ? "Active now"
                  : `Last active ${timeAgo(new Date(session.lastSeenAt), now)}`,
                session.ip,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <View
                  key={session.id}
                  style={[
                    styles.row,
                    i > 0 && {
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: theme.chip,
                    },
                  ]}
                >
                  <View
                    style={[styles.icon, { backgroundColor: theme.greyButton }]}
                  >
                    <SymbolView
                      name={
                        device.kind === "computer"
                          ? {
                              ios: "desktopcomputer",
                              android: "computer",
                              web: "computer",
                            }
                          : {
                              ios: "iphone",
                              android: "smartphone",
                              web: "smartphone",
                            }
                      }
                      tintColor={theme.text}
                      size={16}
                    />
                  </View>

                  <View style={styles.text}>
                    <View style={styles.nameRow}>
                      <Text
                        numberOfLines={1}
                        style={[styles.name, { color: theme.text }]}
                      >
                        {device.name}
                      </Text>
                      {session.current && (
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: theme.moneyInBg },
                          ]}
                        >
                          <Text
                            style={[styles.badgeText, { color: theme.moneyIn }]}
                          >
                            This device
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[styles.meta, { color: theme.textSecondary }]}
                    >
                      {meta}
                    </Text>
                  </View>

                  {!session.current && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Sign out ${device.name}`}
                      hitSlop={8}
                      onPress={() => confirmRevoke(session, device.name)}
                    >
                      <Text style={[styles.signOut, { color: theme.coral }]}>
                        Sign out
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: endingAll }}
          disabled={endingAll}
          onPress={confirmSignOutAll}
          style={({ pressed }) => [
            styles.allButton,
            { backgroundColor: theme.greyButton },
            pressed && styles.pressed,
          ]}
        >
          {endingAll ? (
            <ActivityIndicator color={theme.coral} />
          ) : (
            <Text style={[styles.allText, { color: theme.coral }]}>
              Sign out of all devices
            </Text>
          )}
        </Pressable>
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
  intro: {
    fontSize: 13,
    lineHeight: 18,
  },
  loading: {
    marginVertical: Spacing.four,
  },
  message: {
    fontSize: 13,
    textAlign: "center",
    marginVertical: Spacing.three,
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: Spacing.three,
  },
  row: {
    minHeight: 64,
    paddingVertical: Spacing.two + Spacing.half,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three - Spacing.one,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  name: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  badge: {
    height: 20,
    paddingHorizontal: Spacing.two,
    borderRadius: 10,
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "500",
  },
  meta: {
    fontSize: 11,
  },
  signOut: {
    fontSize: 13,
    fontWeight: "500",
  },
  allButton: {
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  allText: {
    fontSize: 15,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.85,
  },
});
