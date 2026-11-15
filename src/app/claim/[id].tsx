import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { SheetLayout } from "@/components/bottom-sheet";
import { Text } from "@/components/text";
import { useToast } from "@/components/toast";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useSubmitClaim } from "@/hooks/use-winnings";
import {
  ApiError,
  CLAIM_DOCUMENT_TYPES,
  MAX_CLAIM_DOCUMENT_BYTES,
  type LocalFile,
} from "@/lib/api";

type DocumentField = "governmentId" | "proofOfAddress";

/** "Start your prize claim": upload an ID and proof of address, then submit. */
export default function ClaimScreen() {
  const theme = useTheme();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const claim = useSubmitClaim(id);

  const [files, setFiles] = useState<Partial<Record<DocumentField, LocalFile>>>(
    {},
  );
  const [fileErrors, setFileErrors] = useState<
    Partial<Record<DocumentField, string>>
  >({});
  const [agreed, setAgreed] = useState(false);

  const ready =
    !!files.governmentId &&
    !!files.proofOfAddress &&
    agreed &&
    !claim.isPending;

  const pick = async (field: DocumentField) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: CLAIM_DOCUMENT_TYPES,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];

    if (asset.size !== undefined && asset.size > MAX_CLAIM_DOCUMENT_BYTES) {
      setFileErrors((e) => ({
        ...e,
        [field]: "This file is larger than 2MB. Please choose a smaller one.",
      }));
      return;
    }
    setFileErrors((e) => ({ ...e, [field]: undefined }));
    setFiles((f) => ({
      ...f,
      [field]: { uri: asset.uri, name: asset.name, mimeType: asset.mimeType },
    }));
    claim.reset();
  };

  const submit = () => {
    if (!ready || !files.governmentId || !files.proofOfAddress) return;
    claim.mutate(
      {
        governmentId: files.governmentId,
        proofOfAddress: files.proofOfAddress,
      },
      {
        onSuccess: () => {
          router.back();
          toast.show({
            title: "Claim submitted",
            message:
              "Our team will review your information and contact you within 1-3 business days.",
          });
        },
      },
    );
  };

  // KYC must be verified before claiming.
  const needsIdentity =
    claim.error instanceof ApiError && claim.error.status === 403;

  return (
    <SheetLayout
      title="Start your prize claim"
      onClose={() => router.back()}
      tall
      footer={
        <View style={styles.footer}>
          {claim.isError && (
            <View style={styles.errorRow}>
              <Text style={[styles.error, { color: theme.coral }]}>
                {claim.error instanceof ApiError
                  ? claim.error.message
                  : "Couldn't submit your claim. Please try again."}
              </Text>
              {needsIdentity && (
                <Pressable
                  accessibilityRole="link"
                  hitSlop={8}
                  onPress={() => {
                    router.back();
                    router.push("/profile/identity");
                  }}
                >
                  <Text style={[styles.link, { color: theme.brand }]}>
                    Verify your identity
                  </Text>
                </Pressable>
              )}
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !ready, busy: claim.isPending }}
            disabled={!ready}
            onPress={submit}
            style={({ pressed }) => [
              styles.submit,
              { backgroundColor: theme.brand },
              !ready && !claim.isPending && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            {claim.isPending ? (
              <ActivityIndicator color={theme.onBrand} />
            ) : (
              <Text style={[styles.submitText, { color: theme.onBrand }]}>
                Submit
              </Text>
            )}
          </Pressable>
        </View>
      }
    >
      {/* One child, so the sheet's own section spacing doesn't apply here. */}
      <View style={styles.content}>
        <Text style={[styles.intro, { color: theme.text }]}>
          Congratulations on your win! Complete the information below to begin
          your prize claim. Our team will review your submission and contact you
          with the next steps.
        </Text>

        <FileField
          label="Government Issued ID"
          placeholder="Upload your ID"
          file={files.governmentId}
          error={fileErrors.governmentId}
          hints={[
            "International Passport / Driver's Licence / NIN",
            "Max file size 2MB",
          ]}
          onPick={() => pick("governmentId")}
        />

        <FileField
          label="Proof of Address"
          placeholder="Upload a utility bill or bank statement"
          file={files.proofOfAddress}
          error={fileErrors.proofOfAddress}
          hints={["Max file size 2MB"]}
          onPick={() => pick("proofOfAddress")}
        />

        <View style={styles.legal}>
          <Text style={[styles.small, { color: theme.textSecondary }]}>
            I confirm that the information provided is accurate and understand
            that VOUCCOM may request additional documentation to verify my
            identity before processing this claim.
          </Text>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreed }}
            onPress={() => setAgreed((v) => !v)}
            style={styles.agreeRow}
          >
            <View
              style={[
                styles.checkbox,
                { backgroundColor: agreed ? theme.brand : theme.chip },
              ]}
            >
              {agreed && (
                <SymbolView
                  name={{ ios: "checkmark", android: "check", web: "check" }}
                  tintColor={theme.onBrand}
                  size={11}
                />
              )}
            </View>
            <Text style={[styles.agreeText, { color: theme.textSecondary }]}>
              I agree to the{" "}
              {/* TODO: link to the Terms & Conditions once they're published. */}
              <Text style={styles.underline}>Terms & Conditions</Text>
            </Text>
          </Pressable>

          <Text style={[styles.small, { color: theme.textSecondary }]}>
            Once you submit your claim, our team will review your information
            and contact you within 1-3 business days with the next steps.
          </Text>
        </View>
      </View>
    </SheetLayout>
  );
}

function FileField({
  label,
  placeholder,
  file,
  error,
  hints,
  onPick,
}: {
  label: string;
  placeholder: string;
  file?: LocalFile;
  error?: string;
  hints: string[];
  onPick: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          file
            ? `${label}: ${file.name}. Choose another file`
            : `Upload ${label}`
        }
        onPress={onPick}
        style={({ pressed }) => [
          styles.picker,
          { backgroundColor: theme.greyButton },
          pressed && styles.pressed,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.fileName,
            { color: file ? theme.text : theme.placeholder },
          ]}
        >
          {file?.name ?? placeholder}
        </Text>
        <Image
          source={require("@/assets/images/common/Attachment.png")}
          style={styles.clip}
          contentFit="contain"
        />
      </Pressable>
      {error ? (
        <Text style={[styles.hint, { color: theme.coral }]}>{error}</Text>
      ) : (
        hints.map((hint) => (
          <Text
            key={hint}
            style={[styles.hint, { color: theme.textSecondary }]}
          >
            {hint}
          </Text>
        ))
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
  picker: {
    height: 44,
    borderRadius: 22,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two + Spacing.one,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  fileName: {
    flex: 1,
    fontSize: 15,
  },
  clip: {
    width: 20, // Attachment.png is a 4x export (80x80)
    height: 20,
  },
  hint: {
    fontSize: 10,
    lineHeight: 14,
    marginTop: -Spacing.one,
  },
  legal: {
    marginTop: Spacing.five,
    gap: Spacing.three,
  },
  small: {
    fontSize: 10,
    lineHeight: 15,
  },
  agreeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  agreeText: {
    fontSize: 12,
  },
  underline: {
    textDecorationLine: "underline",
  },
  footer: {
    gap: Spacing.two,
  },
  errorRow: {
    alignItems: "center",
    gap: Spacing.one,
  },
  error: {
    fontSize: 12,
    textAlign: "center",
  },
  link: {
    fontSize: 12,
    fontWeight: "600",
  },
  submit: {
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
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
