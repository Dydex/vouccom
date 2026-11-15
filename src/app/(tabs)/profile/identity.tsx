import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NinSheet } from "@/components/nin-sheet";
import { PlainHeader } from "@/components/plain-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import type { VerificationStatus } from "@/data/user";
import { useKyc } from "@/hooks/use-kyc";
import { useTheme } from "@/hooks/use-theme";
import type { KycStatus } from "@/lib/api";

/** The API's KYC state as one of the screen's badges; null = not started. */
function badgeFor(status: KycStatus): VerificationStatus | null {
  switch (status) {
    case "verified":
      return "verified";
    case "pending":
      return "pending";
    case "rejected":
    case "resubmit_required":
      return "failed";
    default:
      return null;
  }
}

/** Exported 4x icons (80x80), shown at 16x16 and tinted. */
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

export default function IdentityVerificationScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const kyc = useKyc();
  const [ninOpen, setNinOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await kyc.refetch();
    setRefreshing(false);
  };

  const ninBadge = kyc.data ? badgeFor(kyc.data.status) : null;
  // Not started: straight to the form. Otherwise: the details page.
  const openNin = !kyc.data
    ? undefined
    : ninBadge
      ? () => router.push("/profile/nin")
      : () => setNinOpen(true);

  const STATUS: Record<
    VerificationStatus,
    { source: number; color: string; label: string }
  > = {
    verified: {
      source: require("@/assets/images/common/Successful.png"),
      color: theme.moneyIn,
      label: "Verified",
    },
    pending: {
      source: require("@/assets/images/common/Pending.png"),
      color: theme.badgeSoon,
      label: "Pending",
    },
    failed: {
      source: require("@/assets/images/common/Failed.png"),
      color: theme.moneyOut,
      label: "Failed",
    },
  };

  const rows: {
    id: string;
    label: string;
    icon: ReactNode;
    status: VerificationStatus | "start" | "loading" | "unavailable";
    onPress?: () => void;
  }[] = [
    {
      id: "bvn",
      label: "BVN",
      icon: (
        <SymbolView
          name={{ ios: "person", android: "person", web: "person" }}
          tintColor={theme.text}
          size={16}
        />
      ),
      // TODO: the API has no BVN check yet.
      status: "unavailable",
    },
    {
      id: "nin",
      label: "NIN",
      icon: (
        <Glyph
          source={require("@/assets/images/common/Trusted.png")}
          color={theme.text}
        />
      ),
      status: kyc.isPending ? "loading" : (ninBadge ?? "start"),
      onPress: openNin,
    },
    {
      id: "id",
      label: "Government Issued ID",
      icon: (
        <Glyph
          source={require("@/assets/images/profile/Docs.png")}
          color={theme.text}
        />
      ),
      // TODO: the API has no ID document check yet.
      status: "unavailable",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PlainHeader title="Identity Verification" fallback="/profile" />

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
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {rows.map((row, i) => {
            const badge =
              row.status === "verified" ||
              row.status === "pending" ||
              row.status === "failed"
                ? STATUS[row.status]
                : null;
            const label =
              badge?.label ??
              {
                start: "Not verified",
                loading: "Loading",
                unavailable: "Not available yet",
              }[row.status as "start" | "loading" | "unavailable"];
            return (
              <Pressable
                key={row.id}
                accessibilityRole="button"
                accessibilityLabel={`${row.label}, ${label}`}
                accessibilityState={{ disabled: !row.onPress }}
                disabled={!row.onPress}
                onPress={row.onPress}
                style={({ pressed }) => [
                  styles.row,
                  i > 0 && {
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: theme.chip,
                  },
                  row.status === "unavailable" && styles.unavailable,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.icon}>{row.icon}</View>
                <Text style={[styles.label, { color: theme.text }]}>
                  {row.label}
                </Text>
                {badge ? (
                  <Glyph source={badge.source} color={badge.color} />
                ) : row.status === "loading" ? (
                  <ActivityIndicator size="small" color={theme.brand} />
                ) : (
                  <Text
                    style={[
                      styles.note,
                      {
                        color:
                          row.status === "start"
                            ? theme.brand
                            : theme.textSecondary,
                      },
                    ]}
                  >
                    {row.status === "start" ? "Verify" : "Soon"}
                  </Text>
                )}
                {row.onPress && (
                  <Image
                    source={require("@/assets/images/common/Arrow Right.png")}
                    style={styles.forward}
                    contentFit="contain"
                    tintColor={theme.text}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {kyc.isError && !kyc.data && (
          <Pressable accessibilityRole="button" onPress={() => kyc.refetch()}>
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              Couldn't load your verification status. Tap to try again.
            </Text>
          </Pressable>
        )}
        {kyc.data?.status === "verified" && kyc.data.legalName && (
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            Verified as {kyc.data.legalName.first} {kyc.data.legalName.last}.
          </Text>
        )}
        {kyc.data?.rejectionReason && ninBadge === "failed" && (
          <Text style={[styles.message, { color: theme.coral }]}>
            {kyc.data.rejectionReason}
          </Text>
        )}
      </ScrollView>

      <NinSheet
        visible={ninOpen}
        onClose={() => setNinOpen(false)}
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
  card: {
    borderRadius: 24,
    paddingHorizontal: Spacing.three,
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
  unavailable: {
    opacity: 0.5,
  },
  note: {
    fontSize: 12,
    fontWeight: "500",
  },
  message: {
    marginTop: Spacing.three,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  icon: {
    width: 20,
    alignItems: "center",
  },
  glyph: {
    width: 16,
    height: 16,
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
  forward: {
    width: 20,
    height: 20, // Arrow Right.png is a 4x export (80x80)
  },
});
