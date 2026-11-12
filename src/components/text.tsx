import {
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from "react-native";

// Space Grotesk comes as one font per weight, so the weight in a style picks the
// font family. (React Native can't do this for custom fonts on its own.)
export const FONT_FILES = {
  light: "SpaceGrotesk_300Light",
  regular: "SpaceGrotesk_400Regular",
  medium: "SpaceGrotesk_500Medium",
  semibold: "SpaceGrotesk_600SemiBold",
  bold: "SpaceGrotesk_700Bold",
} as const;

function familyFor(weight: TextStyle["fontWeight"]): string {
  switch (String(weight ?? "400")) {
    case "100":
    case "200":
    case "300":
      return FONT_FILES.light;
    case "500":
      return FONT_FILES.medium;
    case "600":
      return FONT_FILES.semibold;
    case "700":
    case "800":
    case "900":
    case "bold":
      return FONT_FILES.bold;
    default:
      return FONT_FILES.regular;
  }
}

function withFont(style: StyleProp<TextStyle>): StyleProp<TextStyle> {
  const flat = StyleSheet.flatten(style);
  // An explicit font family in the style wins.
  if (flat?.fontFamily) return style;
  // fontWeight is reset so Android doesn't thicken the font a second time.
  return [
    style,
    { fontFamily: familyFor(flat?.fontWeight), fontWeight: "normal" },
  ];
}

/** Drop-in replacement for React Native's Text, set in Space Grotesk. */
export function Text({ style, ...rest }: TextProps) {
  return <RNText {...rest} style={withFont(style)} />;
}

/** Drop-in replacement for React Native's TextInput, set in Space Grotesk. */
export function TextInput({ style, ...rest }: TextInputProps) {
  return <RNTextInput {...rest} style={withFont(style)} />;
}
