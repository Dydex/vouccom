import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityRow } from "@/components/activity-row";
import { ListHeader } from "@/components/list-header";
import { FloatingTabBarHeight, Spacing } from "@/constants/theme";
import { ACTIVITY } from "@/data/draws";
import { useTheme } from "@/hooks/use-theme";

export default function ActivityScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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
        data={ACTIVITY}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom:
              FloatingTabBarHeight + Math.max(insets.bottom, 12) + Spacing.five,
          },
        ]}
        renderItem={({ item }) => <ActivityRow activity={item} />}
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
});
