import { SymbolView } from "expo-symbols";
import { useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { BottomSheet } from "@/components/bottom-sheet";
import { Text, TextInput } from "@/components/text";
import { useToast } from "@/components/toast";
import { Spacing } from "@/constants/theme";
import { useVerifyNin } from "@/hooks/use-kyc";
import { useTheme } from "@/hooks/use-theme";
import { ApiError, NIGERIAN_STATES, type NigerianState } from "@/lib/api";
import { digitsFromIso, formatDob, parseDob } from "@/lib/dates";
import { useAuth } from "@/state/auth";

type NinSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** The state from an earlier attempt, if any. */
  initialState?: NigerianState;
};

/** Verify identity with a NIN, date of birth and state of origin. */
export function NinSheet({ visible, onClose, initialState }: NinSheetProps) {
  const theme = useTheme();
  const toast = useToast();
  const { user, refreshUser } = useAuth();
  const verify = useVerifyNin();
  const resetVerify = verify.reset;

  const [nin, setNin] = useState("");
  const [dob, setDob] = useState("");
  const [state, setState] = useState<NigerianState>();
  const [statesOpen, setStatesOpen] = useState(false);
  const [rejection, setRejection] = useState<string>();

  // Start fresh, with what we already know, each time the sheet opens.
  const profileDob = user?.profile.dateOfBirth;
  useEffect(() => {
    if (!visible) return;
    setNin("");
    setDob(digitsFromIso(profileDob));
    setState(initialState);
    setStatesOpen(false);
    setRejection(undefined);
    resetVerify();
  }, [visible, profileDob, initialState, resetVerify]);

  const parsedDob = parseDob(dob);
  const dobError =
    dob.length === 8 && "error" in parsedDob ? parsedDob.error : undefined;
  const ready =
    nin.length === 11 && "iso" in parsedDob && !!state && !verify.isPending;

  const submit = () => {
    if (!ready || !state || !("iso" in parsedDob)) return;
    setRejection(undefined);
    verify.mutate(
      { nin, dateOfBirth: parsedDob.iso, state },
      {
        onSuccess: (result) => {
          if (result.status === "verified") {
            refreshUser();
            onClose();
            toast.show({
              title: "Identity verified",
              message: "You can now claim prizes you win.",
            });
          } else {
            setRejection(
              result.reason ??
                result.kyc.rejectionReason ??
                "We couldn't verify these details. Please check them and try again.",
            );
          }
        },
      },
    );
  };

  const error =
    rejection ??
    (verify.isError
      ? verify.error instanceof ApiError
        ? verify.error.message
        : "Couldn't verify your NIN. Please try again."
      : undefined);
  const fullName = user
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : undefined;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Verify your NIN"
      tall
      footer={
        <View style={styles.footer}>
          {error && (
            <Text style={[styles.error, { color: theme.coral }]}>{error}</Text>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !ready, busy: verify.isPending }}
            disabled={!ready}
            onPress={submit}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.brand },
              !ready && !verify.isPending && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            {verify.isPending ? (
              <ActivityIndicator color={theme.onBrand} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.onBrand }]}>
                Verify
              </Text>
            )}
          </Pressable>
        </View>
      }
    >
      {/* One child, so the sheet's own section spacing doesn't apply here. */}
      <View style={styles.content}>
        <Text style={[styles.intro, { color: theme.text }]}>
          We check your National Identification Number against the national
          register.
          {fullName
            ? ` The name on it must match your profile: ${fullName}.`
            : ""}
        </Text>

        <Field label="NIN">
          <TextInput
            value={nin}
            onChangeText={(text) => setNin(text.replace(/\D/g, ""))}
            keyboardType="number-pad"
            maxLength={11}
            placeholder="11-digit NIN"
            placeholderTextColor={theme.placeholder}
            accessibilityLabel="NIN"
            style={[
              styles.input,
              { backgroundColor: theme.greyButton, color: theme.text },
            ]}
          />
        </Field>

        <Field label="Date of birth" error={dobError}>
          <TextInput
            value={formatDob(dob)}
            onChangeText={(text) => setDob(text.replace(/\D/g, "").slice(0, 8))}
            keyboardType="number-pad"
            placeholder="DD/MM/YYYY"
            placeholderTextColor={theme.placeholder}
            accessibilityLabel="Date of birth, day month year"
            style={[
              styles.input,
              { backgroundColor: theme.greyButton, color: theme.text },
            ]}
          />
        </Field>

        <Field label="State of origin">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: statesOpen }}
            onPress={() => setStatesOpen((v) => !v)}
            style={[styles.select, { backgroundColor: theme.greyButton }]}
          >
            <Text
              style={[
                styles.selectText,
                { color: state ? theme.text : theme.placeholder },
              ]}
            >
              {state ?? "Choose your state"}
            </Text>
            <SymbolView
              name={
                statesOpen
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

          {statesOpen && (
            <View style={[styles.states, { backgroundColor: theme.card }]}>
              <ScrollView nestedScrollEnabled>
                {NIGERIAN_STATES.map((name) => {
                  const selected = name === state;
                  return (
                    <Pressable
                      key={name}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => {
                        setState(name);
                        setStatesOpen(false);
                      }}
                      style={({ pressed }) => [
                        styles.stateRow,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.stateText,
                          {
                            color: selected ? theme.brand : theme.text,
                            fontWeight: selected ? "600" : "400",
                          },
                        ]}
                      >
                        {name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </Field>
      </View>
    </BottomSheet>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      {children}
      {error && (
        <Text style={[styles.hint, { color: theme.coral }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
  },
  intro: {
    fontSize: 13,
    lineHeight: 19,
  },
  field: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 15,
  },
  input: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
  },
  select: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 15,
  },
  states: {
    maxHeight: 220,
    borderRadius: 20,
    paddingVertical: Spacing.one,
  },
  stateRow: {
    minHeight: 40,
    paddingHorizontal: Spacing.three,
    justifyContent: "center",
  },
  stateText: {
    fontSize: 14,
  },
  hint: {
    fontSize: 11,
  },
  footer: {
    gap: Spacing.two,
  },
  error: {
    fontSize: 12,
    textAlign: "center",
  },
  button: {
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
