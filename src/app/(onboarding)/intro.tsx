import { Image, type ImageStyle } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  BackHandler,
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Slide = {
  id: string;
  card: "brand" | "accent" | "coral";
  image: number;
  imageStyle: ImageStyle;
  title: string;
  subtitle: string;
};

const SLIDES: Slide[] = [
  {
    id: "discover",
    card: "brand",
    image: require("@/assets/images/onboarding/Discover 4.png"),
    // Centred in the card, nudged to match the design at 406 tall.
    imageStyle: { left: -20, marginTop: -85, width: 331, height: 222 },
    title: "Discover\nYour Dream Asset",
    subtitle:
      "Explore verified vehicles and find\nyour next opportunity on VOUCCOM.",
  },
  {
    id: "closer",
    card: "accent",
    image: require("@/assets/images/onboarding/Voucher 2@4x 1.png"),
    imageStyle: { right: -20, marginTop: -91, width: 322, height: 247 },
    title: "Get Closer To\nYour Dream Asset",
    subtitle:
      "Purchase affordable voucher entries for\na chance to access high-value vehicles.",
  },
  {
    id: "win",
    card: "coral",
    image: require("@/assets/images/onboarding/Die@4x 2.png"),
    imageStyle: {
      alignSelf: "center",
      marginTop: -90,
      width: 308,
      height: 311,
    },
    title: "Take Part for a\nChance to Win!",
    subtitle:
      "Take part in live draws for the opportunity\nto drive away with your chosen asset.",
  },
];

const LAST = SLIDES.length - 1;

/** The intro slides: swipe either way, or use the button. */
export default function IntroScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  // Login's back arrow opens the last slide.
  const { start } = useLocalSearchParams<{ start?: "last" }>();

  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(start === "last" ? LAST : 0);
  // Each slide fills the list's height, so the card can shrink on short screens.
  const [height, setHeight] = useState(0);

  const goTo = (next: number) => {
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  // Android's back button goes to the previous slide before leaving.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (index === 0) return false;
        listRef.current?.scrollToIndex({ index: index - 1, animated: true });
        setIndex(index - 1);
        return true;
      });
      return () => sub.remove();
    }, [index]),
  );

  const next = () => {
    if (index < LAST) goTo(index + 1);
    else router.replace("/login");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <FlatList
        ref={listRef}
        style={styles.list}
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
        data={SLIDES}
        keyExtractor={(slide) => slide.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        initialScrollIndex={start === "last" ? LAST : 0}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item, index: i }) => (
          <View style={[styles.slide, { width, height }]}>
            <View style={[styles.card, { backgroundColor: theme[item.card] }]}>
              <Image
                source={item.image}
                style={[styles.image, item.imageStyle]}
                contentFit="contain"
              />
            </View>

            <View
              style={styles.dots}
              accessibilityLabel={`Page ${i + 1} of ${SLIDES.length}`}
            >
              {SLIDES.map((s, d) => (
                <View
                  key={s.id}
                  style={[
                    d === i ? styles.dotActive : styles.dot,
                    {
                      backgroundColor: d === i ? theme.brand : theme.brandPale,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.copy}>
              <Text style={[styles.title, { color: theme.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.subtitle, { color: theme.text }]}>
                {item.subtitle}
              </Text>
            </View>
          </View>
        )}
      />

      <Pressable
        accessibilityRole="button"
        onPress={next}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.brand },
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.buttonText, { color: theme.onBrand }]}>
          {index === LAST ? "Get Started" : "Next"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: Spacing.four + Spacing.one,
    // Space under the button, above the system navigation bar.
    paddingBottom: Spacing.four,
  },
  list: {
    flex: 1,
    alignSelf: "stretch",
  },
  slide: {
    alignItems: "center",
    paddingHorizontal: Spacing.four - Spacing.one,
  },
  card: {
    alignSelf: "stretch",
    // 406 on a tall phone (the design), but it shrinks so the text and the
    // button always fit on shorter screens.
    flex: 1,
    minHeight: 200,
    maxHeight: 406,
    borderRadius: 28,
  },
  image: {
    position: "absolute",
    top: "50%",
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: 40,
  },
  dotActive: {
    width: 54,
    height: 5,
    borderRadius: 3,
  },
  dot: {
    width: 10,
    height: 5,
    borderRadius: 3,
  },
  copy: {
    alignItems: "center",
    gap: Spacing.three,
    marginTop: 40,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "500",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  button: {
    marginTop: 48,
    width: 170,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
