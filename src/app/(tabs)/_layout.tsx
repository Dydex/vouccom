import { Image } from "expo-image";
import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabListProps,
  type TabTriggerSlotProps,
} from "expo-router/ui";
import { Pressable, StyleSheet, View, type PressableProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FloatingTabBarHeight } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const ICONS: Record<string, number> = {
  home: require("@/assets/images/tabIcons/Home.png"),
  listings: require("@/assets/images/tabIcons/Car.png"),
  draws: require("@/assets/images/tabIcons/Die.png"),
  wallet: require("@/assets/images/tabIcons/Wallet.png"),
  profile: require("@/assets/images/tabIcons/Person.png"),
};

function TabButton({
  isFocused,
  name,
  label,
  ...props
}: TabTriggerSlotProps & { name: string; label: string }) {
  const theme = useTheme();

  return (
    <Pressable
      {...(props as unknown as PressableProps)}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!isFocused }}
      style={[styles.button, isFocused && { backgroundColor: theme.tabActive }]}
    >
      <Image
        source={ICONS[name]}
        style={styles.icon}
        contentFit="contain"
        tintColor={isFocused ? theme.brand : theme.text}
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
          backgroundColor: theme.tabBar,
          bottom: Math.max(insets.bottom, 12) + 8,
          shadowColor: theme.tabGlow,
          shadowOpacity: 0.22,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 0 },
          elevation: theme.tabGlow === "transparent" ? 0 : 10,
        },
      ]}
    />
  );
}

export default function TabsLayout() {
  return (
  
    <Tabs options={{ backBehavior: "history" }}>
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

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 20,
    right: 20,
    height: FloatingTabBarHeight,
    borderRadius: FloatingTabBarHeight / 2,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    width: 26,
    height: 26,
  },
  button: {
    width: 70,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
});
