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
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CardLogo } from "@/components/card-logo";
import { PopoverMenu } from "@/components/popover-menu";
import { SectionBar } from "@/components/section-bar";
import { TransactionRow } from "@/components/transaction-row";
import { useToast } from "@/components/toast";
import { TopUpSheet } from "@/components/top-up-sheet";
import { TransactionSheet } from "@/components/transaction-sheet";
import { formatNaira } from "@/constants/currency";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import type { SavedCard, Transaction } from "@/data/wallet";
import { useTheme } from "@/hooks/use-theme";
import {
  useRemoveCard,
  useSavedCards,
  useWalletActivity,
  useWalletBalance,
} from "@/hooks/use-wallet";
import { ApiError } from "@/lib/api";

const SIDE = 20;

export default function WalletScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const balance = useWalletBalance();
  const activity = useWalletActivity();
  const cards = useSavedCards();
  const removeCard = useRemoveCard();
  const [refreshing, setRefreshing] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([activity.refetch(), cards.refetch()]);
    setRefreshing(false);
  };

  const confirmRemove = (card: SavedCard) =>
    Alert.alert(
      "Remove card?",
      `${card.label} ending ${card.last4} will no longer be offered at checkout.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            removeCard.mutate(card.id, {
              onSuccess: () =>
                toast.show({ tone: "success", message: "Card removed." }),
              onError: (error) =>
                toast.show({
                  tone: "error",
                  message:
                    error instanceof ApiError
                      ? error.message
                      : "Couldn't remove the card.",
                }),
            }),
        },
      ],
    );

  const [selectedTx, setSelectedTx] = useState<Transaction | undefined>();
  const [txOpen, setTxOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.brand}
          />
        }
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.three,
          paddingBottom:
            FloatingTabBarHeight + Math.max(insets.bottom, 12) + Spacing.five,
        }}
      >
        {/* Balance */}
        <View style={[styles.balanceCard, { backgroundColor: theme.brand }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Top up wallet"
            onPress={() => setTopUpOpen(true)}
            style={[styles.topUp, { backgroundColor: theme.balanceButton }]}
          >
            <SymbolView
              name={{ ios: "plus", android: "add", web: "add" }}
              tintColor={theme.onBrand}
              weight="semibold"
              size={16}
            />
            <Text style={[styles.topUpText, { color: theme.onBrand }]}>
              Top Up
            </Text>
          </Pressable>

          <View>
            <Text style={[styles.balanceLabel, { color: theme.onBrand }]}>
              Available balance
            </Text>
            <Text style={[styles.balanceAmount, { color: theme.onBrand }]}>
              {balance === undefined ? "..." : formatNaira(balance)}
            </Text>
          </View>
        </View>

        {/* Payment methods */}
        <SectionBar
          title="Payment Methods"
          barColor={theme.browseBar}
          pillColor={theme.viewAllPill}
          pillTextColor={theme.text}
          actionLabel="Add new"
          // Paystack saves a card when you pay with it; there's no form for it.
          onAction={() =>
            toast.show({
              tone: "info",
              message:
                "Cards are saved when you pay by card, which is coming soon.",
            })
          }
        />
        <View style={styles.list}>
          {cards.isPending ? (
            <ActivityIndicator style={styles.loading} color={theme.brand} />
          ) : cards.isError && !cards.data ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => cards.refetch()}
            >
              <Text style={[styles.message, { color: theme.textSecondary }]}>
                Couldn't load your cards. Tap to try again.
              </Text>
            </Pressable>
          ) : cards.data?.length === 0 ? (
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              No saved cards yet.
            </Text>
          ) : null}
          {cards.data?.map((card) => (
            <View
              key={card.id}
              style={[styles.row, { backgroundColor: theme.card }]}
            >
              <View style={[styles.logo, { backgroundColor: theme.menu }]}>
                <CardLogo brand={card.brand} />
              </View>

              <View style={styles.rowText}>
                <Text style={[styles.title, { color: theme.text }]}>
                  {card.label} **** {card.last4}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={[styles.meta, { color: theme.textSecondary }]}>
                    Expires {card.expires}
                  </Text>
                  {card.bank && (
                    <Text style={[styles.meta, { color: theme.textSecondary }]}>
                      {card.bank}
                    </Text>
                  )}
                </View>
              </View>

              <PopoverMenu
                label={`Options for ${card.label} ending ${card.last4}`}
                options={[{ value: "remove", label: "Remove" }]}
                onSelect={(value) => {
                  if (value === "remove") confirmRemove(card);
                }}
              >
                <SymbolView
                  name={{
                    ios: "ellipsis",
                    android: "more_horiz",
                    web: "more_horiz",
                  }}
                  tintColor={theme.text}
                  weight="bold"
                  size={18}
                />
              </PopoverMenu>
            </View>
          ))}
        </View>

        {/* Recent activity */}
        <SectionBar
          title="Recent activity"
          barColor={theme.browseBar}
          pillColor={theme.viewAllPill}
          pillTextColor={theme.text}
          actionLabel="See all"
          // TODO: open the full transaction history.
        />
        <View style={styles.list}>
          {activity.isPending ? (
            <ActivityIndicator style={styles.loading} color={theme.brand} />
          ) : activity.isError && !activity.data ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => activity.refetch()}
            >
              <Text style={[styles.message, { color: theme.textSecondary }]}>
                Couldn't load your activity. Tap to try again.
              </Text>
            </Pressable>
          ) : activity.data?.length === 0 ? (
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              No wallet activity yet.
            </Text>
          ) : null}
          {activity.data?.map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              onPress={() => {
                setSelectedTx(tx);
                setTxOpen(true);
              }}
            />
          ))}
        </View>
      </ScrollView>

      <TopUpSheet visible={topUpOpen} onClose={() => setTopUpOpen(false)} />

      <TransactionSheet
        visible={txOpen}
        onClose={() => setTxOpen(false)}
        transaction={selectedTx}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  balanceCard: {
    marginHorizontal: SIDE,
    minHeight: 144,
    borderRadius: 28,
    padding: Spacing.four - Spacing.one,
    justifyContent: "space-between",
  },
  topUp: {
    alignSelf: "flex-end",
    height: 40,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  topUpText: {
    fontSize: 14,
    fontWeight: "500",
  },
  balanceLabel: {
    fontSize: 13,
    opacity: 0.7,
  },
  balanceAmount: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: "500",
  },
  loading: {
    marginVertical: Spacing.three,
  },
  message: {
    fontSize: 13,
    textAlign: "center",
    marginVertical: Spacing.two,
  },
  list: {
    marginHorizontal: SIDE,
    gap: Spacing.two,
  },
  row: {
    minHeight: 58,
    borderRadius: 22,
    paddingHorizontal: Spacing.two + Spacing.one,
    paddingVertical: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three - Spacing.one,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  meta: {
    fontSize: 11,
  },
});
