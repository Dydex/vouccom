import { Appearance } from "react-native";

export type AppearancePreference = "system" | "light" | "dark";

let current: AppearancePreference = "system";

export function getAppearance(): AppearancePreference {
  return current;
}

/** Switches the whole app between the phone's setting, light and dark. */
export function setAppearance(preference: AppearancePreference) {
  current = preference;
  // "unspecified" goes back to following the phone.
  // TODO: remember the choice between launches (needs a storage package).
  Appearance.setColorScheme(
    preference === "system" ? "unspecified" : preference,
  );
}
