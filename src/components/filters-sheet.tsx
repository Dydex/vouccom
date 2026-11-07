import { SymbolView } from "expo-symbols";
import { useEffect, useState, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RangeSlider } from "@/components/range-slider";
import { formatNaira } from "@/constants/currency";
import { Spacing } from "@/constants/theme";
import {
  ASSET_RANGE,
  BRAND_GROUPS,
  CATEGORIES,
  DEFAULT_FILTERS,
  PRICE_BUCKETS,
  type EntryFilters,
} from "@/data/filters";
import { useTheme } from "@/hooks/use-theme";

type FiltersSheetProps = {
  visible: boolean;
  /** The filters currently applied. The sheet edits a draft copy of these. */
  filters: EntryFilters;
  onApply: (filters: EntryFilters) => void;
  onClose: () => void;
};

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export function FiltersSheet({
  visible,
  filters,
  onApply,
  onClose,
}: FiltersSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const [draft, setDraft] = useState(filters);
  const [openGroup, setOpenGroup] = useState<string | null>("cars");

  // Start from the applied filters every time the sheet opens.
  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const update = (patch: Partial<EntryFilters>) =>
    setDraft((d) => ({ ...d, ...patch }));

  return (
    <Modal
      transparent
      statusBarTranslucent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close filters"
        />

        <View
          style={[
            styles.sheet,
            { height: height * 0.84, backgroundColor: theme.menu },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: theme.greyButton }]}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Filters
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
              onPress={onClose}
            >
              <SymbolView
                name={{ ios: "xmark", android: "close", web: "close" }}
                tintColor={theme.text}
                size={20}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Section title="Categories">
              {CATEGORIES.map((c) => (
                <CheckRow
                  key={c.id}
                  label={c.label}
                  checked={draft.categories.includes(c.id)}
                  disabled={c.comingSoon}
                  tag={c.comingSoon ? "Coming Soon" : undefined}
                  onPress={() =>
                    update({ categories: toggle(draft.categories, c.id) })
                  }
                />
              ))}
            </Section>

            <Section title="Voucher Price">
              {PRICE_BUCKETS.map((b) => (
                <CheckRow
                  key={b.id}
                  label={b.label}
                  checked={draft.prices.includes(b.id)}
                  onPress={() => update({ prices: toggle(draft.prices, b.id) })}
                />
              ))}
            </Section>

            <Section title="Asset Value Range">
              <View style={styles.rangeRow}>
                <View style={[styles.rangePill, { backgroundColor: theme.card }]}>
                  <Text style={[styles.rangeText, { color: theme.text }]}>
                    {formatNaira(draft.assetRange[0])}
                  </Text>
                </View>
                <Text style={{ color: theme.text }}>-</Text>
                <View style={[styles.rangePill, { backgroundColor: theme.card }]}>
                  <Text style={[styles.rangeText, { color: theme.text }]}>
                    {formatNaira(draft.assetRange[1])}
                  </Text>
                </View>
              </View>
              <RangeSlider
                {...ASSET_RANGE}
                value={draft.assetRange}
                onChange={(assetRange) => update({ assetRange })}
              />
            </Section>

            <Section title="Brands">
              {BRAND_GROUPS.map((group) => {
                const expanded = openGroup === group.id;
                return (
                  <View key={group.id}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded }}
                      onPress={() => setOpenGroup(expanded ? null : group.id)}
                      style={styles.groupHeader}
                    >
                      <Text
                        style={[styles.groupLabel, { color: theme.placeholder }]}
                      >
                        {group.label}
                      </Text>
                      <SymbolView
                        name={
                          expanded
                            ? {
                                ios: "chevron.up",
                                android: "keyboard_arrow_up",
                                web: "keyboard_arrow_up",
                              }
                            : {
                                ios: "chevron.down",
                                android: "keyboard_arrow_down",
                                web: "keyboard_arrow_down",
                              }
                        }
                        tintColor={theme.placeholder}
                        size={14}
                      />
                    </Pressable>

                    {expanded && (
                      <View style={styles.chips}>
                        {group.brands.map((brand) => {
                          const selected = draft.brands.includes(brand);
                          return (
                            <Pressable
                              key={brand}
                              accessibilityRole="checkbox"
                              accessibilityState={{ checked: selected }}
                              onPress={() =>
                                update({ brands: toggle(draft.brands, brand) })
                              }
                              style={[
                                styles.chip,
                                {
                                  backgroundColor: selected
                                    ? theme.brandPale
                                    : theme.card,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.chipText,
                                  {
                                    color: selected
                                      ? theme.onBadge
                                      : theme.placeholder,
                                  },
                                  selected && styles.chipSelected,
                                ]}
                              >
                                {brand}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </Section>
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                backgroundColor: theme.menu,
                paddingBottom: Math.max(insets.bottom, 12) + Spacing.two,
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              onPress={() => setDraft(DEFAULT_FILTERS)}
              style={[styles.footerButton, { backgroundColor: theme.greyButton }]}
            >
              <Text style={[styles.footerText, { color: theme.text }]}>
                Clear Filters
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onApply(draft);
                onClose();
              }}
              style={[
                styles.footerButton,
                styles.confirm,
                { backgroundColor: theme.brand },
              ]}
            >
              <Text style={[styles.footerText, { color: theme.onBrand }]}>
                Confirm
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {children}
    </View>
  );
}

function CheckRow({
  label,
  checked,
  disabled,
  tag,
  onPress,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  tag?: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.checkRow, disabled && styles.disabled]}
    >
      <View
        style={[
          styles.box,
          { backgroundColor: checked ? theme.textSecondary : theme.chip },
        ]}
      >
        {checked && (
          <SymbolView
            name={{ ios: "checkmark", android: "check", web: "check" }}
            tintColor={theme.onBrand}
            size={10}
          />
        )}
      </View>
      <Text
        style={[
          styles.checkLabel,
          { color: checked ? theme.text : theme.placeholder },
        ]}
      >
        {label}
      </Text>
      {tag && (
        <View style={[styles.tag, { backgroundColor: theme.drawsBar }]}>
          <Text style={[styles.tagText, { color: theme.coral }]}>{tag}</Text>
        </View>
      )}
    </Pressable>
  );
}

const SIDE = 26;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  header: {
    height: 68,
    paddingHorizontal: SIDE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  content: {
    paddingHorizontal: SIDE,
    paddingVertical: Spacing.three,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two + Spacing.one,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: Spacing.one,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    minHeight: 28,
  },
  disabled: {
    opacity: 0.5,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
  },
  tag: {
    height: 20,
    paddingHorizontal: Spacing.two,
    borderRadius: 10,
    justifyContent: "center",
  },
  tagText: {
    fontSize: 9,
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  rangePill: {
    height: 32,
    paddingHorizontal: Spacing.three,
    borderRadius: 16,
    justifyContent: "center",
  },
  rangeText: {
    fontSize: 12,
  },
  groupHeader: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  groupLabel: {
    fontSize: 14,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two + Spacing.one,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.two,
  },
  chip: {
    height: 34,
    paddingHorizontal: Spacing.three,
    borderRadius: 17,
    justifyContent: "center",
  },
  chipText: {
    fontSize: 13,
  },
  chipSelected: {
    fontWeight: "600",
  },
  footer: {
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    gap: Spacing.three,
  },
  footerButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  confirm: {
    flex: 1.2,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
