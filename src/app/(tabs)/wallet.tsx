import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CardFormSheet } from "@/components/card-form-sheet";
import { CardLogo } from "@/components/card-logo";
import { PopoverMenu } from "@/components/popover-menu";
import { SectionBar } from "@/components/section-bar";
import { TransactionSheet } from "@/components/transaction-sheet";
import { formatNaira } from "@/constants/currency";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import {
  SAVED_CARDS,
  TRANSACTIONS,
  WALLET_BALANCE,
  type Transaction,
} from "@/data/wallet";
import { useTheme } from "@/hooks/use-theme";

const SIDE = 20;

function signedNaira(amount: number): string {
  return `${amount >= 0 ? "+" : "-"}${formatNaira(Math.abs(amount))}`;
}

export default function WalletScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // TODO: saving the default card belongs on the backend.
  const [cards, setCards] = useState(SAVED_CARDS);

  // One form for both adding a card and editing one.
  const [formOpen, setFormOpen] = useState(false);
  // Kept after closing so the form keeps its content while it fades out.
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingCard = cards.find((c) => c.id === editingId);

  const [selectedTx, setSelectedTx] = useState<Transaction | undefined>();
  const [txOpen, setTxOpen] = useState(false);

  const setDefault = (id: string) =>
    setCards((list) => list.map((c) => ({ ...c, isDefault: c.id === id })));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
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
            // TODO: start a wallet top-up.
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
              {formatNaira(WALLET_BALANCE)}
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
          onAction={() => {
            setEditingId(null);
            setFormOpen(true);
          }}
        />
        <View style={styles.list}>
          {cards.map((card) => (
            <View
              key={card.id}
              style={[styles.row, { backgroundColor: theme.card }]}
            >
              <View style={[styles.logo, { backgroundColor: theme.menu }]}>
                <CardLogo brand={card.brand} />
              </View>

              <View style={styles.rowText}>
                <Text style={[styles.title, { color: theme.text }]}>
                  {card.brand} **** {card.last4}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={[styles.meta, { color: theme.textSecondary }]}>
                    Expires {card.expires}
                  </Text>
                  {card.isDefault && (
                    <Text style={[styles.meta, { color: theme.textSecondary }]}>
                      Default
                    </Text>
                  )}
                </View>
              </View>

              <PopoverMenu
                label={`Options for ${card.brand} ending ${card.last4}`}
                options={[
                  { value: "edit", label: "Edit" },
                  ...(card.isDefault
                    ? []
                    : [{ value: "default", label: "Set as default" }]),
                ]}
                onSelect={(value) => {
                  if (value === "default") setDefault(card.id);
                  if (value === "edit") {
                    setEditingId(card.id);
                    setFormOpen(true);
                  }
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
          {TRANSACTIONS.map((tx) => (
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

      <TransactionSheet
        visible={txOpen}
        onClose={() => setTxOpen(false)}
        transaction={selectedTx}
      />

      <CardFormSheet
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        card={editingCard}
        onSubmit={(result) =>
          setCards((list) => {
            // The first card, or one saved with "set as default", becomes the default.
            const makeDefault = result.setAsDefault || list.length === 0;
            const fields = {
              brand: result.brand,
              last4: result.last4,
              expires: result.expires,
              name: result.name,
            };

            if (editingCard) {
              return list.map((c) =>
                c.id === editingCard.id
                  ? { ...c, ...fields, isDefault: makeDefault || c.isDefault }
                  : makeDefault
                    ? { ...c, isDefault: false }
                    : c,
              );
            }
            return [
              ...list.map((c) =>
                makeDefault ? { ...c, isDefault: false } : c,
              ),
              { id: `card-${Date.now()}`, ...fields, isDefault: makeDefault },
            ];
          })
        }
      />
    </View>
  );
}

function TransactionRow({
  tx,
  onPress,
}: {
  tx: Transaction;
  onPress: () => void;
}) {
  const theme = useTheme();
  const incoming = tx.amount >= 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${tx.title}, ${signedNaira(tx.amount)}. View details`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.card },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.logo,
          { backgroundColor: incoming ? theme.moneyInBg : theme.moneyOutBg },
        ]}
      >
        <Image
          source={require("@/assets/images/common/backarrow.png")}
          style={[
            styles.arrow,
            // The back arrow points left: turned a quarter either way it points up or down.
            { transform: [{ rotate: incoming ? "90deg" : "-90deg" }] },
          ]}
          contentFit="contain"
          tintColor={incoming ? theme.moneyIn : theme.moneyOut}
        />
      </View>

      <View style={styles.rowText}>
        <Text style={[styles.title, { color: theme.text }]}>{tx.title}</Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          {tx.time}
        </Text>
      </View>

      <View style={styles.amountColumn}>
        <Text
          style={[
            styles.amount,
            { color: incoming ? theme.moneyIn : theme.moneyOut },
          ]}
        >
          {signedNaira(tx.amount)}
        </Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          view details
        </Text>
      </View>
    </Pressable>
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
  pressed: {
    opacity: 0.85,
  },
  arrow: {
    width: 18,
    height: 14, // backarrow.png is a 4x export (72x56)
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
  amountColumn: {
    alignItems: "flex-end",
    gap: Spacing.half,
  },
  amount: {
    fontSize: 14,
    fontWeight: "500",
  },
});
