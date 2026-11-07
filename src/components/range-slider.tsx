import { useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

const THUMB = 16;
const TOUCH = 36;

type RangeSliderProps = {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
};

/** Two-thumb slider. Thumbs can't cross; values snap to `step`. */
export function RangeSlider({
  min,
  max,
  step,
  value,
  onChange,
}: RangeSliderProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  // Pan handlers are created once, so they read the latest props through a ref.
  const latest = useRef({ min, max, step, value, onChange, width });
  latest.current = { min, max, step, value, onChange, width };
  const startValue = useRef(0);

  const makeResponder = (which: 0 | 1) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      // Keep the gesture when this sits inside a ScrollView.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        startValue.current = latest.current.value[which];
      },
      onPanResponderMove: (_, g) => {
        const { min, max, step, value, onChange, width } = latest.current;
        if (width <= 0) return;
        const raw = startValue.current + (g.dx / width) * (max - min);
        const snapped = Math.round((raw - min) / step) * step + min;
        if (which === 0) {
          onChange([Math.min(Math.max(snapped, min), value[1] - step), value[1]]);
        } else {
          onChange([value[0], Math.max(Math.min(snapped, max), value[0] + step)]);
        }
      },
    });

  const lowResponder = useMemo(() => makeResponder(0), []);
  const highResponder = useMemo(() => makeResponder(1), []);

  const toX = (v: number) => ((v - min) / (max - min)) * width;
  const lowX = toX(value[0]);
  const highX = toX(value[1]);

  return (
    <View
      style={styles.container}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <View style={[styles.track, { backgroundColor: theme.chip }]} />
      <View
        style={[
          styles.active,
          {
            left: lowX,
            width: Math.max(highX - lowX, 0),
            backgroundColor: theme.brand,
            opacity: 0.6,
          },
        ]}
      />
      {[
        { x: lowX, responder: lowResponder, label: "Minimum value" },
        { x: highX, responder: highResponder, label: "Maximum value" },
      ].map(({ x, responder, label }) => (
        <View
          key={label}
          {...responder.panHandlers}
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          style={[styles.touch, { left: x - TOUCH / 2 }]}
        >
          <View
            style={[
              styles.thumb,
              { backgroundColor: theme.brand, borderColor: theme.brandPale },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: TOUCH,
    justifyContent: "center",
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  active: {
    position: "absolute",
    height: 4,
    borderRadius: 2,
  },
  touch: {
    position: "absolute",
    width: TOUCH,
    height: TOUCH,
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
  },
});
