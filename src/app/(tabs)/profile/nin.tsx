import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NinSheet } from "@/components/nin-sheet";
import { PlainHeader } from "@/components/plain-header";
import { Text } from "@/components/text";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { useKyc } from "@/hooks/use-kyc";
import { useTheme } from "@/hooks/use-theme";
import type { KycStatus } from "@/lib/api";
import { formatCalendarDate } from "@/lib/dates";
import { useAuth } from "@/state/auth";

const TITLES: Record<KycStatus, string> = {
  verified: "NIN Verified",
  pending: "NIN pending verification",
  rejected: "NIN verification failed",
  resubmit_required: "NIN verification failed",
  unverified: "NIN verification",
};

/** "NIN details": what was verified, or why it failed. */
export default function NinDetailsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const kyc = useKyc();
  const [formOpen, setFormOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await kyc.refetch();
    setRefreshing(false);
  };

  const status = kyc.data?.status;
  const failed = status === "rejected" || status === "resubmit_required";
  const legalName = kyc.data?.legalName;
  const name = legalName
    ? [legalName.first, legalName.middle, legalName.last]
        .filter(Boolean)
        .join(" ")
    : undefined;

  // The API doesn't send the NIN back, so it isn't shown.
  const details = [
    { label: "Name on NIN", value: name },
    {
      label: "Date of birth",
      value: formatCalendarDate(user?.profile.dateOfBirth),
    },
    { label: "State of origin", value: kyc.data?.state },
    { label: "Verified on", value: formatCalendarDate(kyc.data?.verifiedAt) },
  ].filter((row): row is { label: string; value: string } => !!row.value);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PlainHeader
        title={status ? TITLES[status] : "NIN verification"}
        fallback="/profile/identity"
      />

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
        {kyc.isPending ? (
          <ActivityIndicator style={styles.loading} color={theme.brand} />
        ) : kyc.isError && !kyc.data ? (
          <Pressable accessibilityRole="button" onPress={() => kyc.refetch()}>
            <Text style={[styles.value, { color: theme.textSecondary }]}>
              Couldn't load your verification. Tap to try again.
            </Text>
          </Pressable>
        ) : failed || status === "unverified" ? (
          <View style={styles.section}>
            <Text style={[styles.heading, { color: theme.text }]}>
              {failed ? "Please re-enter your NIN" : "Verify your NIN"}
            </Text>
            {kyc.data?.rejectionReason && (
              <Text style={[styles.value, { color: theme.coral }]}>
                {kyc.data.rejectionReason}
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={() => setFormOpen(true)}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.brand },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.buttonText, { color: theme.onBrand }]}>
                {failed ? "Try again" : "Verify NIN"}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={[styles.heading, { color: theme.text }]}>
              NIN details
            </Text>
            {details.map((row) => (
              <View key={row.label} style={styles.detail}>
                <Text style={[styles.label, { color: theme.text }]}>
                  {row.label}
                </Text>
                <Text style={[styles.value, { color: theme.textSecondary }]}>
                  {row.value}
                </Text>
              </View>
            ))}
            {status === "pending" && (
              <Text style={[styles.value, { color: theme.textSecondary }]}>
                We're checking your details. Pull down to check for an update.
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <NinSheet
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        initialState={kyc.data?.state}
      />
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
  loading: {
    marginTop: Spacing.five,
  },
  section: {
    gap: Spacing.four,
  },
  heading: {
    fontSize: 14,
    fontWeight: "500",
  },
  detail: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  value: {
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.85,
  },
});
