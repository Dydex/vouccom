import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { registerPushDevice, unregisterPushDevice } from "@/lib/api";

// Show notifications that arrive while the app is open, too.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** The token registered with the backend, so sign-out can remove it. */
let registeredToken: string | null = null;

/**
 * Asks for permission (once) and returns this phone's Expo push token,
 * or null if push isn't available or the user said no.
 */
async function getPushToken(): Promise<string | null> {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return null;

  // Android 13+ only shows the permission prompt once a channel exists.
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Notifications",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const status =
    current.status === "granted" || !current.canAskAgain
      ? current.status
      : (await Notifications.requestPermissionsAsync()).status;
  if (status !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId) return null;

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

/** The registration in progress, so overlapping calls share it. */
let registering: Promise<void> | null = null;

/** Registers this phone for the signed-in user. Never throws. */
export function registerForPush() {
  registering ??= register().finally(() => {
    registering = null;
  });
  return registering;
}

async function register() {
  try {
    const token = await getPushToken();
    if (!token) return;
    // For sending a test push from https://expo.dev/notifications.
    if (__DEV__) console.log("Expo push token:", token);
    await registerPushDevice(token, Platform.OS as "ios" | "android");
    registeredToken = token;
  } catch {
    // Expo Go on Android, a simulator without push, or no network: try next start.
  }
}

/** Stops pushes to this phone. Call before signing out. Never throws. */
export async function unregisterFromPush() {
  const token = registeredToken;
  registeredToken = null;
  if (!token) return;
  try {
    await unregisterPushDevice(token);
  } catch {
    // The next account to sign in on this phone takes the token over anyway.
  }
}
