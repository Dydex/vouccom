import { useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/bottom-sheet";
import { Text, TextInput } from "@/components/text";
import { useToast } from "@/components/toast";
import { Spacing } from "@/constants/theme";
import { useUpdateProfile } from "@/hooks/use-profile";
import { useTheme } from "@/hooks/use-theme";
import { ApiError, type ProfileUpdate, type User } from "@/lib/api";
import { digitsFromIso, formatDob, parseDob } from "@/lib/dates";

export type ProfileSection = "name" | "address" | "dob";

const TITLES: Record<ProfileSection, string> = {
  name: "Edit account name",
  address: "Edit address",
  dob: "Change date of birth",
};

type Values = Record<string, string>;

/** The form's starting values, from the user. */
function initialValues(section: ProfileSection, user: User | null): Values {
  const p = user?.profile;
  switch (section) {
    case "name":
      return { firstName: p?.firstName ?? "", lastName: p?.lastName ?? "" };
    case "address":
      return {
        address: p?.address ?? "",
        city: p?.city ?? "",
        country: p?.country ?? "",
      };
    case "dob":
      return { dob: digitsFromIso(p?.dateOfBirth) };
  }
}

/** The change to send, or why the form can't be saved yet. */
function toUpdate(
  section: ProfileSection,
  v: Values,
): { update: ProfileUpdate } | { error?: string } {
  switch (section) {
    case "name": {
      const firstName = v.firstName.trim();
      const lastName = v.lastName.trim();
      if (!firstName || !lastName) return {};
      return { update: { firstName, lastName } };
    }
    case "address": {
      // Empty fields clear what was there.
      const clean = (s: string) => s.trim() || null;
      return {
        update: {
          address: clean(v.address),
          city: clean(v.city),
          country: clean(v.country),
        },
      };
    }
    case "dob": {
      if (v.dob.length < 8) return {};
      const parsed = parseDob(v.dob);
      return "iso" in parsed
        ? { update: { dateOfBirth: parsed.iso } }
        : { error: parsed.error };
    }
  }
}

type EditProfileSheetProps = {
  visible: boolean;
  onClose: () => void;
  section: ProfileSection;
  user: User | null;
};

/** Edits one part of the profile: the name, the address or the date of birth. */
export function EditProfileSheet({
  visible,
  onClose,
  section,
  user,
}: EditProfileSheetProps) {
  const theme = useTheme();
  const toast = useToast();
  const save = useUpdateProfile();

  // The values are stored with the section they belong to, so one section's
  // values can never be read as another's.
  const [form, setForm] = useState<{
    section: ProfileSection;
    values: Values;
  } | null>(null);

  // Start from the saved profile each time the sheet opens.
  const [openedFor, setOpenedFor] = useState<ProfileSection | null>(null);
  const current = visible ? section : null;
  if (current !== openedFor) {
    setOpenedFor(current);
    if (current)
      setForm({ section: current, values: initialValues(current, user) });
  }

  // Until the reset above takes effect, fall back to the saved profile.
  const values =
    form?.section === section ? form.values : initialValues(section, user);

  const close = () => {
    save.reset();
    onClose();
  };

  const result = toUpdate(section, values);
  const ready = "update" in result && !save.isPending;
  const set = (key: string) => (text: string) =>
    setForm({ section, values: { ...values, [key]: text } });

  const submit = () => {
    if (!("update" in result) || save.isPending) return;
    save.mutate(result.update, {
      onSuccess: () => {
        close();
        toast.show({ tone: "success", message: "Your profile was updated." });
      },
    });
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.greyButton, color: theme.text },
  ];

  return (
    <BottomSheet
      visible={visible}
      onClose={close}
      title={TITLES[section]}
      footer={
        <View style={styles.footer}>
          {save.isError && (
            <Text style={[styles.error, { color: theme.coral }]}>
              {save.error instanceof ApiError
                ? save.error.message
                : "Couldn't save your changes. Please try again."}
            </Text>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !ready, busy: save.isPending }}
            disabled={!ready}
            onPress={submit}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.brand },
              !ready && !save.isPending && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            {save.isPending ? (
              <ActivityIndicator color={theme.onBrand} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.onBrand }]}>
                Save
              </Text>
            )}
          </Pressable>
        </View>
      }
    >
      {/* One child, so the sheet's own section spacing doesn't apply here. */}
      <View style={styles.content}>
        {section === "name" && (
          <>
            <Field label="First name">
              <TextInput
                value={values.firstName}
                onChangeText={set("firstName")}
                autoComplete="given-name"
                textContentType="givenName"
                maxLength={60}
                style={inputStyle}
              />
            </Field>
            <Field label="Last name">
              <TextInput
                value={values.lastName}
                onChangeText={set("lastName")}
                autoComplete="family-name"
                textContentType="familyName"
                maxLength={60}
                style={inputStyle}
              />
            </Field>
          </>
        )}

        {section === "address" && (
          <>
            <Field label="Address">
              <TextInput
                value={values.address}
                onChangeText={set("address")}
                autoComplete="street-address"
                textContentType="fullStreetAddress"
                maxLength={200}
                style={inputStyle}
              />
            </Field>
            <Field label="City">
              <TextInput
                value={values.city}
                onChangeText={set("city")}
                textContentType="addressCity"
                maxLength={100}
                style={inputStyle}
              />
            </Field>
            <Field label="Country">
              <TextInput
                value={values.country}
                onChangeText={set("country")}
                autoComplete="country"
                textContentType="countryName"
                maxLength={100}
                style={inputStyle}
              />
            </Field>
          </>
        )}

        {section === "dob" && (
          <Field
            label="Date of birth"
            error={"error" in result ? result.error : undefined}
          >
            <TextInput
              value={formatDob(values.dob)}
              onChangeText={(text) =>
                set("dob")(text.replace(/\D/g, "").slice(0, 8))
              }
              keyboardType="number-pad"
              placeholder="DD/MM/YYYY"
              placeholderTextColor={theme.placeholder}
              accessibilityLabel="Date of birth, day month year"
              style={inputStyle}
            />
          </Field>
        )}
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
