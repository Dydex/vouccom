import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { Text } from "@/components/text";
import { formatNaira } from "@/constants/currency";
import { Spacing } from "@/constants/theme";
import {
  refreshAfterPurchase,
  usePaymentStatus,
  type PaymentKind,
  type PaymentResult,
} from "@/hooks/use-checkout";
import { useTheme } from "@/hooks/use-theme";
import { walletKey } from "@/hooks/use-wallet";
import { ApiError, type Wallet } from "@/lib/api";

// Paystack's own "close" page, shown when the user cancels on its page.
const PAYSTACK_CLOSE = "standard.paystack.co/close";

type Phase =
  | { name: "paying" }
  // `finished` is true when Paystack sent the user back, false when they closed it.
  | { name: "checking"; finished: boolean };

/** Paystack's checkout page for a card checkout or a top-up, then the result. */
export default function PaymentScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const {
    url,
    reference,
    kind = "checkout",
  } = useLocalSearchParams<{
    url: string;
    reference: string;
    kind?: PaymentKind;
  }>();

  const [phase, setPhase] = useState<Phase>({ name: "paying" });
  const checking = phase.name === "checking";
  const status = usePaymentStatus(kind, reference, {
    enabled: checking,
    poll: checking && phase.finished,
  });
  const result = status.data?.status;

  // Money moved: show the new balance and refresh what changed.
  const newBalance = status.data?.walletBalanceKobo;
  useEffect(() => {
    if (result !== "succeeded" && result !== "refunded") return;
    if (kind === "topup") {
      if (newBalance !== undefined) {
        queryClient.setQueryData<Wallet>(
          walletKey,
          (old) => old && { ...old, balanceKobo: newBalance },
        );
      }
      queryClient.invalidateQueries({ queryKey: walletKey });
    } else {
      refreshAfterPurchase(queryClient);
    }
  }, [result, kind, newBalance, queryClient]);

  // Paystack sends the user to the callback URL with the reference when done.
  const onRequest = ({ url: next }: { url: string }) => {
    const done =
      next.includes(`reference=${reference}`) ||
      next.includes(`trxref=${reference}`);
    if (done || next.includes(PAYSTACK_CLOSE)) {
      setPhase({ name: "checking", finished: done });
      return false;
    }
    return true;
  };

  const close = () => {
    if (checking) router.back();
    else setPhase({ name: "checking", finished: false });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: theme.greyButton }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {checking
            ? kind === "topup"
              ? "Top up"
              : "Payment"
            : "Secure payment"}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
          onPress={close}
        >
          <SymbolView
            name={{ ios: "xmark", android: "close", web: "close" }}
            tintColor={theme.text}
            size={20}
          />
        </Pressable>
      </View>

      {!checking ? (
        <WebView
          source={{ uri: url }}
          onShouldStartLoadWithRequest={onRequest}
          startInLoadingState
          renderLoading={() => (
            <ActivityIndicator
              style={StyleSheet.absoluteFill}
              size="large"
              color={theme.brand}
            />
          )}
        />
      ) : (
        <View
          style={[
            styles.result,
            { paddingBottom: Math.max(insets.bottom, 12) + Spacing.four },
          ]}
        >
          <Result
            loading={
              status.isPending || (result === "pending" && status.isFetching)
            }
            error={status.isError ? status.error : null}
            kind={kind}
            data={status.data}
            onCheckAgain={() => status.refetch()}
          />
        </View>
      )}
    </View>
  );
}

type Message = { title: string; body: string; retry?: boolean };

function messageFor(kind: PaymentKind, data?: PaymentResult): Message {
  const amount = formatNaira((data?.amountKobo ?? 0) / 100);

  if (kind === "topup") {
    switch (data?.status) {
      case "succeeded":
        return {
          title: "Wallet topped up",
          body:
            data.walletBalanceKobo === undefined
              ? `${amount} was added to your wallet.`
              : `${amount} was added. Your balance is now ${formatNaira(data.walletBalanceKobo / 100)}.`,
        };
      case "failed":
        return {
          title: "Top-up failed",
          body: "The payment didn't go through, so nothing was added to your wallet.",
        };
      case "abandoned":
        return {
          title: "Top-up cancelled",
          body: "The payment wasn't completed, so nothing was charged.",
        };
      default:
        return {
          title: "Top-up not confirmed yet",
          body: "If you completed the payment, your balance will update once it's confirmed.",
          retry: true,
        };
    }
  }

  switch (data?.status) {
    case "succeeded":
      return {
        title: "Payment successful",
        body: "You're in the draw! Your tickets are in My Entries.",
      };
    case "refunded":
      return {
        title: "We couldn't complete your order",
        body: `Your card was charged ${amount}, so we've added it to your wallet.`,
      };
    case "failed":
      return {
        title: "Payment failed",
        body: "The payment didn't go through. You can try again with another card or your wallet.",
      };
    default:
      return {
        title: "Payment not confirmed yet",
        body: "If you completed the payment, your tickets will appear in My Entries once it's confirmed.",
        retry: true,
      };
  }
}

function Result({
  loading,
  error,
  kind,
  data,
  onCheckAgain,
}: {
  loading: boolean;
  error: Error | null;
  kind: PaymentKind;
  data?: PaymentResult;
  onCheckAgain: () => void;
}) {
  const theme = useTheme();

  if (loading) {
    return (
      <View style={styles.message}>
        <ActivityIndicator size="large" color={theme.brand} />
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          Confirming your payment...
        </Text>
      </View>
    );
  }

  const content: Message = error
    ? {
        title: "Couldn't check your payment",
        body:
          error instanceof ApiError
            ? error.message
            : "Please check your connection and try again.",
        retry: true,
      }
    : messageFor(kind, data);

  return (
    <>
      <View style={styles.message}>
        <Text style={[styles.title, { color: theme.text }]}>
          {content.title}
        </Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          {content.body}
        </Text>
      </View>

      <View style={styles.actions}>
        {content.retry && (
          <Pressable
            accessibilityRole="button"
            onPress={onCheckAgain}
            style={[styles.button, { backgroundColor: theme.greyButton }]}
          >
            <Text style={[styles.buttonText, { color: theme.text }]}>
              Check again
            </Text>
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={[styles.button, { backgroundColor: theme.brand }]}
        >
          <Text style={[styles.buttonText, { color: theme.onBrand }]}>
            Done
          </Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    paddingHorizontal: Spacing.four,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  result: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: "space-between",
  },
  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
  title: {
    fontSize: 22,
    fontWeight: "500",
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  actions: {
    gap: Spacing.three,
  },
  button: {
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
