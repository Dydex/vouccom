import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/bottom-sheet";
import { Text } from "@/components/text";
import { formatNaira } from "@/constants/currency";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Win } from "@/lib/winnings";
import { useAuth } from "@/state/auth";

/** The steps of a claim, as shown on the progress tracker. */
const STEPS = [
  "Winner Selected",
  "Identity Verified",
  "Claim Submitted",
  "Documentation Review",
  "Approved",
  "Delivered",
];

type WinClaimSheetProps = {
  visible: boolean;
  onClose: () => void;
  win?: Win;
};

type Stage = {
  title: string;
  headline: string;
  subtitle: string;
  body: string;
  /** Before claiming: the claim button's label. */
  claimAction?: string;
  claimDisabled?: boolean;
  /** After claiming: the current step on the tracker. */
  step?: number;
  /** The prize has been delivered: a grey card and "Browse listings". */
  completed?: boolean;
};

function stageFor(win: Win, firstName?: string): Stage {
  if (win.expired || win.claimStatus === "forfeited") {
    return {
      title: "Win claim",
      headline: "Claim window closed",
      subtitle: `You won a ${win.vehicle}`,
      body: "The claim deadline for this prize has passed.",
      claimAction: "Claim window closed",
      claimDisabled: true,
    };
  }
  switch (win.claimStatus) {
    case "claimed":
      return {
        title: "Ongoing win claim",
        headline: "Claim in progress!",
        subtitle: "Your asset is being processed.",
        body: "We've received your claim request. You can track each stage of the verification and delivery process from your dashboard",
        step: 3,
      };
    case "approved":
      return {
        title: "Ongoing win claim",
        headline: "Claim approved!",
        subtitle: "Your asset is being prepared for delivery.",
        body: "Your claim has been verified. We'll contact you to arrange delivery of your vehicle.",
        step: 4,
      };
    case "delivered":
      return {
        title: "Claim completed",
        headline: "Claim Finalised!",
        subtitle: `Congratulations on your new ${win.vehicle}`,
        body: "Congratulations on your successful claim. New opportunities are added regularly - discover the latest listings and take part in your next draw.",
        completed: true,
      };
    default:
      return {
        title: "Start win claim",
        headline: firstName
          ? `Congratulations, ${firstName}!`
          : "Congratulations!",
        subtitle: `You're the Winner of a ${win.vehicle}`,
        body: "Congratulations! Your entry was successfully selected in the live draw. Begin the claim process to verify your details and arrange delivery of your vehicle.",
        claimAction: win.documentsRequest
          ? "Upload new documents"
          : "Start claim process",
      };
  }
}

/** The win pop-up: "Start win claim" before claiming, "Ongoing win claim" after. */
export function WinClaimSheet({ visible, onClose, win }: WinClaimSheetProps) {
  const theme = useTheme();
  const firstName = useAuth().user?.profile.firstName;
  const stage = win && stageFor(win, firstName);

  const viewDraw = (listingId: string) => {
    onClose();
    router.push({ pathname: "/listing/[id]", params: { id: listingId } });
  };

  const startClaim = (winId: string) => {
    onClose();
    router.push({ pathname: "/claim/[id]", params: { id: winId } });
  };

  const browseListings = () => {
    onClose();
    router.push("/listings");
  };

  // With a second button, "View draw details" becomes the grey one.
  const claiming = stage?.claimAction !== undefined;
  const twoButtons = claiming || !!stage?.completed;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={stage?.title ?? "Win claim"}
      tall
      footer={
        win &&
        stage && (
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={!win.listingId}
              onPress={() => win.listingId && viewDraw(win.listingId)}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: twoButtons ? theme.greyButton : theme.brand,
                },
                !win.listingId && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: twoButtons ? theme.text : theme.onBrand },
                ]}
              >
                View draw details
              </Text>
            </Pressable>
            {claiming && (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !!stage.claimDisabled }}
                disabled={stage.claimDisabled}
                onPress={() => startClaim(win.id)}
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: theme.brand },
                  stage.claimDisabled && styles.disabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.buttonText, { color: theme.onBrand }]}>
                  {stage.claimAction}
                </Text>
              </Pressable>
            )}
            {stage.completed && (
              <Pressable
                accessibilityRole="button"
                onPress={browseListings}
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: theme.brand },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.buttonText, { color: theme.onBrand }]}>
                  Browse listings
                </Text>
              </Pressable>
            )}
          </View>
        )
      }
    >
      {win && stage && (
        // One child, so the sheet's own section spacing doesn't apply here.
        <View style={styles.content}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: stage.completed
                  ? theme.cardMedia
                  : theme.winsBar,
              },
            ]}
          >
            {/* Behind everything else on the card, cut off by its edges. */}
            <Image
              source={
                stage.completed
                  ? require("@/assets/images/wins/Grey 3D Star.png")
                  : require("@/assets/images/wins/3D Star.png")
              }
              style={styles.stars}
              contentFit="contain"
            />
            <Text style={[styles.headline, { color: theme.onBadge }]}>
              {stage.headline}
            </Text>
            <Text style={[styles.subtitle, { color: theme.onBadge }]}>
              {stage.subtitle}
            </Text>

            {win.image ? (
              <Image
                source={win.image}
                style={styles.car}
                contentFit="contain"
                accessibilityLabel={win.vehicle}
              />
            ) : (
              <View style={styles.car} />
            )}

            <View style={styles.star}>
              <Image
                source={
                  stage.completed
                    ? require("@/assets/images/wins/Grey Star.png")
                    : require("@/assets/images/wins/Star.png")
                }
                style={styles.starIcon}
                contentFit="contain"
              />
            </View>

            <Text style={[styles.body, { color: theme.onBadge }]}>
              {stage.body}
            </Text>
          </View>

          {win.documentsRequest && claiming && !stage.claimDisabled && (
            <Text style={[styles.request, { color: theme.coral }]}>
              We need new documents: {win.documentsRequest}
            </Text>
          )}

          <View style={styles.grid}>
            <Detail label="Winning Entry" value={win.winningEntry} />
            <Detail label="Prize value" value={formatNaira(win.assetValue)} />
            <Detail label="Vehicle" value={win.vehicle} />
            <Detail label="Claim deadline" value={win.claimDeadline} />
          </View>

          {stage.step !== undefined && <ClaimTracker step={stage.step} />}
        </View>
      )}
    </BottomSheet>
  );
}

const DOT = 10;

/** Dots for each claim step, filled up to the current one, with its name above it. */
function ClaimTracker({ step }: { step: number }) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const [labelWidth, setLabelWidth] = useState(0);

  // Dot centres, inset so the end dots stay inside the row.
  const xFor = (i: number) =>
    DOT / 2 + ((width - DOT) * i) / (STEPS.length - 1);
  const current = xFor(step);
  const labelLeft = Math.min(
    Math.max(current - labelWidth / 2, 0),
    Math.max(width - labelWidth, 0),
  );
  const measured = width > 0 && labelWidth > 0;

  return (
    <View
      accessible
      accessibilityLabel={`Claim progress: step ${step + 1} of ${STEPS.length}, ${STEPS[step]}`}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={styles.tracker}
    >
      <View style={styles.labelRow}>
        <View
          onLayout={(e) => setLabelWidth(e.nativeEvent.layout.width)}
          style={[
            styles.label,
            {
              backgroundColor: theme.moneyInBg,
              left: labelLeft,
              opacity: measured ? 1 : 0,
            },
          ]}
        >
          <Text style={[styles.labelText, { color: theme.moneyIn }]}>
            {STEPS[step]}
          </Text>
        </View>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.line,
            { left: DOT / 2, right: DOT / 2, backgroundColor: theme.chip },
          ]}
        />
        <View
          style={[
            styles.line,
            {
              left: DOT / 2,
              width: Math.max(current - DOT / 2, 0),
              backgroundColor: theme.moneyIn,
            },
          ]}
        />
        {measured &&
          STEPS.map((name, i) => (
            <View
              key={name}
              style={[
                styles.dot,
                {
                  left: xFor(i) - DOT / 2,
                  backgroundColor: i <= step ? theme.moneyIn : theme.chip,
                },
              ]}
            />
          ))}
      </View>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={styles.detail}>
      <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
  },
  card: {
    borderRadius: 28,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    alignItems: "center",
    overflow: "hidden",
  },
  stars: {
    position: "absolute",
    right: -26,
    bottom: 0,
    width: 186, // 3D Star.png is a 4x export (746x823)
    height: 206,
  },
  headline: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  subtitle: {
    marginTop: Spacing.two,
    fontSize: 13,
    textAlign: "center",
  },
  car: {
    width: "100%",
    height: 140,
    marginTop: Spacing.three,
  },
  star: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // White on the yellow card in both themes.
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.two,
  },
  starIcon: {
    width: 18, // Star.png is a 4x export (72x70)
    height: 18,
  },
  body: {
    marginTop: Spacing.three,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  request: {
    fontSize: 13,
    lineHeight: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: Spacing.four,
  },
  detail: {
    width: "50%",
    gap: Spacing.two,
    paddingRight: Spacing.two,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 18,
  },
  tracker: {
    gap: Spacing.two,
  },
  labelRow: {
    height: 22,
  },
  label: {
    position: "absolute",
    top: 0,
    height: 22,
    paddingHorizontal: Spacing.two + Spacing.one,
    borderRadius: 11,
    justifyContent: "center",
  },
  labelText: {
    fontSize: 11,
  },
  track: {
    height: DOT,
  },
  line: {
    position: "absolute",
    top: DOT / 2 - 1,
    height: 2,
    borderRadius: 1,
  },
  dot: {
    position: "absolute",
    top: 0,
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
  actions: {
    gap: Spacing.two + Spacing.one,
  },
  button: {
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
