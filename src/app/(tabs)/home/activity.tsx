import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityRow } from "@/components/activity-row";
import { ListHeader } from "@/components/list-header";
import { PurchaseReceiptSheet } from "@/components/purchase-receipt-sheet";
import { Text } from "@/components/text";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { usePurchases } from "@/hooks/use-purchases";
import { useTheme } from "@/hooks/use-theme";
import { ApiError, type ApiPurchase } from "@/lib/api";
import { toActivity } from "@/lib/purchases";

export default function ActivityScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const purchases = usePurchases();
  const rows = useMemo(() => {
    const now = new Date();
    return (purchases.data ?? []).map((purchase) => ({
      purchase,
      activity: toActivity(purchase, now),
    }));
  }, [purchases.data]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await purchases.refetch();
    setRefreshing(false);
  };

  const [selected, setSelected] = useState<ApiPurchase>();
  const [receiptOpen, setReceiptOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ListHeader
        title="Activity"
        backgroundColor={theme.activityBar}
        image={require("@/assets/images/headers/Time New@4x 1.png")}
        imageWidth={232}
        imageHeight={131}
        // The export has ~17px of transparent padding on its right.
        imageRight={-8}
        // The band is dark in dark mode and light in light mode.
        statusBarStyle="auto"
        contentColor={theme.text}
      />

      <FlatList
        data={rows}
        keyExtractor={(item) => item.activity.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.brand}
          />
        }
        onEndReached={() => {
          if (purchases.hasNextPage && !purchases.isFetching) {
            purchases.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          purchases.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footer} color={theme.brand} />
          ) : undefined
        }
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom:
              FloatingTabBarHeight + Math.max(insets.bottom, 12) + Spacing.five,
          },
        ]}
        ListEmptyComponent={
          purchases.isPending ? (
            <ActivityIndicator
              style={styles.loading}
              size="large"
              color={theme.brand}
            />
          ) : purchases.isError && !purchases.data ? (
            <View style={styles.errorBox}>
              <Text style={[styles.empty, { color: theme.textSecondary }]}>
                {purchases.error instanceof ApiError
                  ? purchases.error.message
                  : "Couldn't load your activity."}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => purchases.refetch()}
                hitSlop={8}
              >
                <Text style={[styles.retryText, { color: theme.brand }]}>
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : (
            <Text style={[styles.empty, { color: theme.textSecondary }]}>
              No activity yet. Your purchases will show up here.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <ActivityRow
            activity={item.activity}
            onPress={() => {
              setSelected(item.purchase);
              setReceiptOpen(true);
            }}
          />
        )}
      />

      <PurchaseReceiptSheet
        visible={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        purchase={selected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  footer: {
    marginVertical: Spacing.four,
  },
  loading: {
    marginTop: Spacing.six,
  },
  errorBox: {
    alignItems: "center",
    gap: Spacing.three,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  empty: {
    marginTop: Spacing.five,
    textAlign: "center",
    fontSize: 14,
  },
});
