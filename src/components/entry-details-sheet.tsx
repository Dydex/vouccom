import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { BottomSheet } from "@/components/bottom-sheet";
import { PurchaseReceiptSheet } from "@/components/purchase-receipt-sheet";
import { Text } from "@/components/text";
import { Spacing } from "@/constants/theme";
import type { Entry } from "@/data/entries";
import { useMyTickets } from "@/hooks/use-listings";
import { usePurchases } from "@/hooks/use-purchases";
import { useTheme } from "@/hooks/use-theme";
import { useWinnings } from "@/hooks/use-winnings";
import type { ApiPurchase } from "@/lib/api";
import { isApiListingId } from "@/lib/listings";

/** Ticket chips shown before "+N more". */
const MAX_CHIPS = 60;

type EntryDetailsSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** An entry's id is its listing's id. */
  entry?: Entry;
};

/** "My entry details": status, ticket numbers and, once drawn, the winning entry. */
export function EntryDetailsSheet({
  visible,
  onClose,
  entry,
}: EntryDetailsSheetProps) {
  const theme = useTheme();
  const listingId = entry?.id ?? "";
  const live = !!entry && isApiListingId(listingId);

  const tickets = useMyTickets(listingId, visible && live);
  const purchases = usePurchases();
  const winnings = useWinnings();

  const winner = tickets.data?.winner;
  const won = !!winner?.isMe;
  const win = winnings.data?.find((w) => w.listingId === listingId);
  const canClaim =
    won && win?.claimStatus === "selected" && !win.expired && !!win.id;
  // The latest successful purchase on this listing, for its receipt.
  const purchase = purchases.data?.find(
    (p) => p.listingId === listingId && p.status === "succeeded",
  );

  // iOS can't open the receipt sheet until this one has finished closing.
  const [receipt, setReceipt] = useState<ApiPurchase>();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const afterClose = useRef<(() => void) | null>(null);

  const showReceipt = (p: ApiPurchase) => {
    onClose();
    const open = () => {
      setReceipt(p);
      setReceiptOpen(true);
    };
    if (Platform.OS === "ios") afterClose.current = open;
    else open();
  };

  const viewListing = () => {
    onClose();
    router.push({ pathname: "/listing/[id]", params: { id: listingId } });
  };

  const startClaim = (winId: string) => {
    onClose();
    router.push({ pathname: "/claim/[id]", params: { id: winId } });
  };

  const watchReplay = (url: string) => {
    WebBrowser.openBrowserAsync(url).catch(() => {});
  };

  const status = winner
    ? "Draw Complete"
    : entry?.status === "completed"
      ? "Awaiting result"
      : entry?.daysLeft
        ? `Awaiting Draw · ${entry.daysLeft} ${entry.daysLeft === 1 ? "day" : "days"} left`
        : "Awaiting Draw · Draw today";

  const numbers = [...(tickets.data?.ticketNumbers ?? [])].sort(
    (a, b) => a - b,
  );
  const shown = numbers.slice(0, MAX_CHIPS);
  const hidden = numbers.length - shown.length;

  // Before the draw: Transaction detail + View listing.
  // After it: Start claim (if you won) or View listing, + View draw replay.
  const secondary = winner
    ? canClaim && win
      ? { label: "Start claim process", onPress: () => startClaim(win.id) }
      : { label: "View listing", onPress: viewListing }
    : purchase
      ? { label: "Transaction detail", onPress: () => showReceipt(purchase) }
      : undefined;
  const primary = winner
    ? winner.drawVideoUrl
      ? {
          label: "View draw replay",
          onPress: () => watchReplay(winner.drawVideoUrl as string),
        }
      : { label: "View listing", onPress: viewListing }
    : { label: "View listing", onPress: viewListing };

  return (
    <>
      <BottomSheet
        visible={visible}
        onClose={onClose}
        onDismiss={() => {
          afterClose.current?.();
          afterClose.current = null;
        }}
        title="My entry details"
        tall
        footer={
          entry &&
          live && (
            <View style={styles.actions}>
              {secondary && secondary.label !== primary.label && (
                <Pressable
                  accessibilityRole="button"
                  onPress={secondary.onPress}
                  style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: theme.greyButton },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.buttonText, { color: theme.text }]}>
                    {secondary.label}
                  </Text>
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={primary.onPress}
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: theme.brand },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.buttonText, { color: theme.onBrand }]}>
                  {primary.label}
                </Text>
              </Pressable>
            </View>
          )
        }
      >
        {entry && (
          // One child, so the sheet's own section spacing doesn't apply here.
          <View style={styles.content}>
            <Field label="Asset" value={entry.title} />
            <Field label="Status" value={status} />

            {winner && (
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Winning Entry
                </Text>
                <Text style={[styles.big, { color: theme.winsBar }]}>
                  #{winner.ticketNumber}
                </Text>
              </View>
            )}

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                My Entries
              </Text>
              <Text style={[styles.big, { color: theme.text }]}>
                {tickets.data?.quantity ?? entry.entries}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                My Entry Numbers
              </Text>
              {!live ? (
                <Text style={[styles.value, { color: theme.textSecondary }]}>
                  Not available for this entry.
                </Text>
              ) : tickets.isPending ? (
                <ActivityIndicator style={styles.loading} color={theme.brand} />
              ) : tickets.isError && !tickets.data ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => tickets.refetch()}
                >
                  <Text style={[styles.value, { color: theme.textSecondary }]}>
                    Couldn't load your entry numbers. Tap to try again.
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.chips}>
                  {shown.map((n) => {
                    const winning = n === winner?.ticketNumber;
                    return (
                      <View
                        key={n}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: winning
                              ? theme.winsBar
                              : theme.card,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            winning
                              ? { color: theme.onBadge, fontWeight: "600" }
                              : { color: theme.placeholder },
                          ]}
                        >
                          #{n}
                        </Text>
                      </View>
                    );
                  })}
                  {hidden > 0 && (
                    <View
                      style={[styles.chip, { backgroundColor: theme.card }]}
                    >
                      <Text
                        style={[styles.chipText, { color: theme.placeholder }]}
                      >
                        +{hidden} more
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        )}
      </BottomSheet>

      <PurchaseReceiptSheet
        visible={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        purchase={receipt}
      />
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 12,
  },
  value: {
    fontSize: 13,
    fontWeight: "500",
  },
  big: {
    fontSize: 22,
    fontWeight: "500",
  },
  loading: {
    alignSelf: "flex-start",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  chip: {
    height: 28,
    paddingHorizontal: Spacing.two + Spacing.one,
    borderRadius: 14,
    justifyContent: "center",
  },
  chipText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  button: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.85,
  },
});
