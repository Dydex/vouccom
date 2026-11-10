import { StyleSheet, View } from "react-native";

/** A phone outline with one short dash near the bottom, as in the design. */
export function PhoneIcon({ color }: { color: string }) {
  return (
    <View style={[styles.phone, { borderColor: color }]}>
      <View style={[styles.dash, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  phone: {
    width: 12,
    height: 18,
    borderWidth: 1.2,
    borderRadius: 3.5,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 2,
  },
  dash: {
    width: 4,
    height: 1.2,
    borderRadius: 1,
  },
});
