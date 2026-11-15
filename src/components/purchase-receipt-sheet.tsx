import { TransactionSheet } from "@/components/transaction-sheet";
import { usePurchase } from "@/hooks/use-purchases";
import type { ApiPurchase } from "@/lib/api";
import { purchaseTransaction, receiptTransaction } from "@/lib/purchases";

type PurchaseReceiptSheetProps = {
  visible: boolean;
  onClose: () => void;
  purchase?: ApiPurchase;
};

/** A purchase's receipt in the Transaction details pop-up. */
export function PurchaseReceiptSheet({
  visible,
  onClose,
  purchase,
}: PurchaseReceiptSheetProps) {
  const receipt = usePurchase(purchase, visible);

  // The row's own details show straight away; the receipt fills in the rest.
  const transaction = receipt.data
    ? receiptTransaction(receipt.data)
    : purchase && {
        ...purchaseTransaction(purchase),
        ...(receipt.isError && {
          method: "Unavailable",
          reference: "Unavailable",
        }),
      };

  return (
    <TransactionSheet
      visible={visible}
      onClose={onClose}
      transaction={transaction}
    />
  );
}
