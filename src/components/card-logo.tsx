import { Image } from "expo-image";
import { StyleSheet } from "react-native";

import type { CardBrand } from "@/data/wallet";

/** The exported Visa or Mastercard logo for a saved card. */
export function CardLogo({ brand }: { brand: CardBrand }) {
  return brand === "VISA" ? (
    <Image
      source={require("@/assets/images/payments/visa.png")}
      style={styles.visa}
      contentFit="contain"
      accessibilityLabel="Visa"
    />
  ) : (
    <Image
      source={require("@/assets/images/payments/mastercard.png")}
      style={styles.mastercard}
      contentFit="contain"
      accessibilityLabel="Mastercard"
    />
  );
}

const styles = StyleSheet.create({
  visa: {
    width: 30, // visa.png is a 4x export (118x67)
    height: 17,
  },
  mastercard: {
    width: 26, // mastercard.png is a ~3.6x export (93x58)
    height: 16,
  },
});
