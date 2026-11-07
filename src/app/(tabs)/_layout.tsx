import { Image } from "expo-image";
import { usePathname } from "expo-router";
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

/** Sub-screens that live under a tab and should keep that tab highlighted. */
const CHILD_ROUTES: Record<string, string[]> = {
  home: ["/entries", "/myDraws", "/myWins", "/activity"],
};

function TabButton({
  isFocused,
  name,
  label,
  ...props
}: TabTriggerSlotProps & { name: string; label: string }) {
  const theme = useTheme();
  const pathname = usePathname();
  const active = !!isFocused || !!CHILD_ROUTES[name]?.includes(pathname);

  return (
    <Pressable
      {...(props as unknown as PressableProps)}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={[styles.button, active && { backgroundColor: theme.tabActive }]}
    >
      <Image
        source={ICONS[name]}
        style={styles.icon}
        contentFit="contain"
        tintColor={active ? theme.brand : theme.text}
      />
    </Pressable>
  );
}

/** Registers a route with the tab navigator without rendering a button for it. */
function HiddenTab(_props: TabTriggerSlotProps) {
  return null;
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

export default function TabsLayout() {
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
          <TabTrigger name="entries" href="/entries" asChild>
            <HiddenTab />
          </TabTrigger>
          <TabTrigger name="myDraws" href="/myDraws" asChild>
            <HiddenTab />
          </TabTrigger>
          <TabTrigger name="myWins" href="/myWins" asChild>
            <HiddenTab />
          </TabTrigger>
          <TabTrigger name="activity" href="/activity" asChild>
            <HiddenTab />
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
