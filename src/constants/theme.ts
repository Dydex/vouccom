/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1E1F20",
    accountLoginText: "#1E1F20",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    greyButton: "#EDEEF1",
    card: "#F7F8F8",
    menu: "#FFFFFF",
    dropdown: "#FFFFFF",
    prefix: "#DADCE2",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
    brand: "#2855FF",
    brandPale: "#D6E9FF",
    onBrand: "#FFFFFF",
    accent: "#48F99C",
    coral: "#FF808B",
    iconPink: "#FF9CA4",
    statusUpcoming: "#29C674",
    statusCompleted: "#8E95A2",
    search: "#1E1F20",
    placeholder: "#A3A6AD",
    eyeIcon: "#B6BAC3",
    toastSurface: "#1E1F20",
    toastGlow: "#B7C4E0",
    toastTitle: "#EDEEF1",
    toastMessage: "#6B7280",
    surface: "#F4F5F8",
    cardMedia: "#D8DBDF",
    chip: "#DADCE2",
    browseBar: "#EEF6FF",
    viewAllPill: "#E2F0FF",
    entriesBar: "#ECFEF5",
    entriesPill: "#C3FDDF",
    drawsBar: "#FFEEF0",
    drawsPill: "#FFD3D7",
    winsBar: "#FFD700",
    winsPill: "#FFE972",
    winRow: "#FFFAE3",
    activityBar: "#D8DBDF",
    activityPill: "#B6BAC3",
    activityIcon: "#EDEEF1",
    badgeNew: "#71FAB2",
    badgeSoon: "#FFE039",
    onBadge: "#1E1F20",
    balanceButton: "#1438B8",
    tabActive: "#E0E1E6",
  },
  dark: {
    text: "#ffffff",
    accountLoginText: "#EDEEF1",
    background: "#1E1E1E",
    backgroundElement: "#212225",
    greyButton: "#40444C",
    card: "#40444C",
    menu: "#2E3036",
    dropdown: "#474C53",
    prefix: "#5B616E",
    backgroundSelected: "#2E3135",
    textSecondary: "#6B7280",
    brand: "#2855FF",
    brandPale: "#D6E9FF",
    onBrand: "#FFFFFF",
    accent: "#48F99C",
    coral: "#FF808B",
    iconPink: "#FF9CA4",
    statusUpcoming: "#29C674",
    statusCompleted: "#8E95A2",
    search: "#EDEEF1",
    placeholder: "#6B6F76",
    eyeIcon: "#B6BAC3",
    toastSurface: "#1E1F20",
    toastGlow: "#B7C4E0",
    toastTitle: "#EDEEF1",
    toastMessage: "#6B7280",
    surface: "#25272C",
    cardMedia: "#D8DBDF",
    chip: "#383A42",
    browseBar: "#282C36",
    viewAllPill: "#28304A",
    entriesBar: "#233A31",
    entriesPill: "#2F5B48",
    drawsBar: "#3B2A2E",
    drawsPill: "#5A3239",
    winsBar: "#FFD700",
    winsPill: "#FFE766",
    winRow: "#34342E",
    activityBar: "#40444C",
    activityPill: "#464A52",
    activityIcon: "#383A42",
    badgeNew: "#71FAB2",
    badgeSoon: "#FFE039",
    onBadge: "#1E1F20",
    balanceButton: "#1438B8",
    tabActive: "#383B41",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  seven: 128,
  eight: 256,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
/** Height of the floating bottom tab bar, so screens can leave room under their content. */
export const FloatingTabBarHeight = 62;
