import { SymbolView } from "expo-symbols";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ToastOptions = {
  message: string;
  /** Adding a title switches to the larger "card" style. */
  title?: string;
  variant?: "pill" | "card";
  /** Defaults to "success" for cards and "info" for pills. */
  tone?: "success" | "error" | "info";
  position?: "top" | "bottom" | "center";
  /** How long it stays on screen, in ms. */
  duration?: number;
};

type ToastContextValue = {
  show: (options: ToastOptions) => void;
  hide: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const ANIMATION_MS = 220;
const DEFAULT_DURATION = 3000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const hide = useCallback(() => {
    clearTimer();
    Animated.timing(progress, {
      toValue: 0,
      duration: ANIMATION_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setToast(null);
    });
  }, [progress]);

  const show = useCallback(
    (options: ToastOptions) => {
      clearTimer();
      progress.stopAnimation();
      progress.setValue(0);
      setToast(options);
      Animated.timing(progress, {
        toValue: 1,
        duration: ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      timer.current = setTimeout(hide, options.duration ?? DEFAULT_DURATION);
    },
    [hide, progress],
  );

  useEffect(() => clearTimer, []);

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && <ToastView toast={toast} progress={progress} onPress={hide} />}
    </ToastContext.Provider>
  );
}

function ToastBadge({
  tone,
  size,
}: {
  tone: NonNullable<ToastOptions["tone"]>;
  size: number;
}) {
  const theme = useTheme();

  if (tone === "success") {
    return (
      <View
        style={[
          styles.badge,
          {
            width: size,
            height: size,
            borderRadius: size * 0.3,
            backgroundColor: "rgba(72, 249, 156, 0.12)",
          },
        ]}
      >
        <SymbolView
          name={{ ios: "checkmark", android: "check", web: "check" }}
          tintColor={theme.accent}
          weight="bold"
          size={size * 0.45}
        />
      </View>
    );
  }

  const color = tone === "error" ? theme.coral : theme.toastMessage;
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: color,
        },
      ]}
    >
      <SymbolView
        name={
          tone === "error"
            ? {
                ios: "exclamationmark",
                android: "priority_high",
                web: "priority_high",
              }
            : { ios: "info", android: "info_i", web: "info_i" }
        }
        tintColor={color}
        weight="bold"
        size={size * 0.45}
      />
    </View>
  );
}

function ToastView({
  toast,
  progress,
  onPress,
}: {
  toast: ToastOptions;
  progress: Animated.Value;
  onPress: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const variant = toast.variant ?? (toast.title ? "card" : "pill");
  const tone = toast.tone ?? (variant === "card" ? "success" : "info");
  // Success pills use a green surface; everything else keeps the dark one.
  const surface =
    tone === "success" && variant === "pill"
      ? theme.toastSuccess
      : theme.toastSurface;
  const messageColor = tone === "info" ? theme.toastMessage : theme.toastTitle;
  const position = toast.position ?? (variant === "card" ? "center" : "top");

  const offset = position === "top" ? -16 : position === "bottom" ? 16 : 0;
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [offset, 0],
  });
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [position === "center" ? 0.95 : 1, 1],
  });

  const glow = {
    backgroundColor: surface,
    shadowColor: theme.toastGlow,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.overlay,
        {
          justifyContent:
            position === "top"
              ? "flex-start"
              : position === "bottom"
                ? "flex-end"
                : "center",
          paddingTop: insets.top + Spacing.two,
          paddingBottom: insets.bottom + Spacing.three,
        },
      ]}
    >
      <Animated.View
        style={{ opacity: progress, transform: [{ translateY }, { scale }] }}
      >
        <Pressable
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          onPress={onPress}
        >
          {variant === "card" ? (
            <View
              style={[
                styles.card,
                glow,
                { width: Math.min(322, width - Spacing.four * 2) },
              ]}
            >
              <ToastBadge tone={tone} size={36} />
              {toast.title && (
                <Text style={[styles.title, { color: theme.toastTitle }]}>
                  {toast.title}
                </Text>
              )}
              <Text
                style={[
                  styles.message,
                  styles.centered,
                  { color: theme.toastMessage },
                ]}
              >
                {toast.message}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.pill,
                glow,
                { width: width - (Spacing.four - Spacing.one) * 2 },
              ]}
            >
              <ToastBadge tone={tone} size={32} />
              <Text
                style={[styles.message, { color: messageColor }]}
                numberOfLines={2}
              >
                {toast.message}
              </Text>
            </View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  pill: {
    minHeight: 60,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  card: {
    borderRadius: 28,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    alignItems: "center",
    gap: Spacing.two,
  },
  title: {
    marginTop: Spacing.one,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "500",
    textAlign: "center",
  },
  message: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  centered: {
    flex: 0,
    textAlign: "center",
  },
});
