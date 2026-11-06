import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabListProps,
  type TabTriggerSlotProps,
} from "expo-router/ui";
import { SymbolView } from "expo-symbols";
import { Pressable, type PressableProps, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/hooks/use-theme";

type TabIcon = {
  ios: { off: string; on: string };
  material: string;
};

const ICONS: Record<string, TabIcon> = {
  home: { ios: { off: "house", on: "house.fill" }, material: "home" },
  listings: { ios: { off: "car", on: "car.fill" }, material: "directions_car" },
  draws: { ios: { off: "dice", on: "dice.fill" }, material: "casino" },
  wallet: {
    ios: { off: "wallet.pass", on: "wallet.pass.fill" },
    material: "account_balance_wallet",
  },
  profile: { ios: { off: "person", on: "person.fill" }, material: "person" },
};

function TabButton({
  isFocused,
  name,
  label,
  ...props
}: TabTriggerSlotProps & { name: string; label: string }) {
  const theme = useTheme();
  const icon = ICONS[name];

  return (
    <Pressable
      {...(props as unknown as PressableProps)}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!isFocused }}
      style={[
        styles.button,
        isFocused && { backgroundColor: theme.tabActive },
      ]}
    >
      <SymbolView
        name={{
          ios: (isFocused ? icon.ios.on : icon.ios.off) as never,
          android: icon.material as never,
          web: icon.material as never,
        }}
        tintColor={isFocused ? theme.brand : theme.text}
        size={24}
      />
    </Pressable>
  );
}

function FloatingTabList(props: TabListProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      {...props}
      style={[
        styles.bar,
        {
          backgroundColor: theme.surface,
          bottom: Math.max(insets.bottom, 12) + 8,
        },
      ]}
    />
  );
}

export default function FloatingTabs() {
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <FloatingTabList>
          <TabTrigger name="home" href="/home" asChild>
            <TabButton name="home" label="Home" />
          </TabTrigger>
          <TabTrigger name="listings" href="/listings" asChild>
            <TabButton name="listings" label="Listings" />
          </TabTrigger>
          <TabTrigger name="draws" href="/draws" asChild>
            <TabButton name="draws" label="Draws" />
          </TabTrigger>
          <TabTrigger name="wallet" href="/wallet" asChild>
            <TabButton name="wallet" label="Wallet" />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton name="profile" label="Profile" />
          </TabTrigger>
        </FloatingTabList>
      </TabList>
    </Tabs>
  );
}

/** Height the floating bar takes up, so screens can leave room under their content. */
export const FLOATING_TAB_BAR_HEIGHT = 62;

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 20,
    right: 20,
    height: FLOATING_TAB_BAR_HEIGHT,
    borderRadius: FLOATING_TAB_BAR_HEIGHT / 2,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    width: 70,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
});
