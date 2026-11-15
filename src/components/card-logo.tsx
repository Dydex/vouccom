import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { StyleSheet } from "react-native";

import type { CardBrand } from "@/data/wallet";
import { useTheme } from "@/hooks/use-theme";

/** The Visa or Mastercard logo for a saved card, or a generic card icon. */
export function CardLogo({ brand }: { brand: CardBrand }) {
  const theme = useTheme();

  if (brand === "Card") {
    return (
      <SymbolView
        name={{ ios: "creditcard", android: "credit_card", web: "credit_card" }}
        tintColor={theme.text}
        size={18}
      />
    );
  }

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
