import * as SecureStore from "expo-secure-store";
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
import { AppState } from "react-native";

import {
  ApiError,
  getMe,
  login,
  logout,
  setAuthToken,
  type User,
} from "@/lib/api";

/** Where the token is kept on the phone (encrypted by the system). */
const TOKEN_KEY = "vouccom.session-token";

/** While signed in without user details (we started offline), retry this often. */
const RETRY_EVERY_MS = 30_000;

/**
 * How long the startup check may hold the splash screen. If the server is this
 * slow, we let the user in and keep trying in the background instead.
 */
const STARTUP_TIMEOUT_MS = 5_000;

type AuthStatus = "restoring" | "signedOut" | "signedIn";

/** What happened when we asked the server for the user. */
type LoadResult = "loaded" | "rejected" | "unreachable" | "busy";

type AuthContextValue = {
  status: AuthStatus;
  /** Null while restoring, when signed out, or if we couldn't load it (offline). */
  user: User | null;
  /** Throws an ApiError when the email or password is wrong. */
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  /** Fetch the user again, e.g. for pull-to-refresh or after editing the profile. */
  refreshUser: () => Promise<unknown>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Gives every screen access to the session. Wrap the whole app in it once. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("restoring");
  const [user, setUser] = useState<User | null>(null);

  // Forget the session on this phone (the server has already rejected it,
  // or the user asked to sign out).
  const clearSession = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
    setStatus("signedOut");
  }, []);

  // Ask the server who the token belongs to. Three possible outcomes:
  //   it answers       -> we have the user
  //   it says 401      -> the token is dead, sign out
  //   it can't be reached -> we learned nothing, keep the token and try later
  const loadingUser = useRef(false);
  const loadUser = useCallback(
    async (timeoutMs?: number): Promise<LoadResult> => {
      if (loadingUser.current) return "busy"; // a request is already on its way
      loadingUser.current = true;
      try {
        const { user } = await getMe({ timeoutMs });
        setUser(user);
        return "loaded";
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearSession();
          return "rejected";
        }
        // Anything else (offline, server hiccup): keep things as they are.
        return "unreachable";
      } finally {
        loadingUser.current = false;
      }
    },
    [clearSession],
  );

  // When the app starts: is there a saved token, and is it still valid?
  useEffect(() => {
    async function restore() {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        setStatus("signedOut");
        return;
      }

      setAuthToken(token);
      // Still "restoring" (splash screen up) while we check the token, so a
      // dead token never flashes the Home screen.
      const result = await loadUser(STARTUP_TIMEOUT_MS);
      // "rejected" has already signed us out. Otherwise we're signed in, even
      // if offline: user stays null and the effect below keeps trying.
      if (result !== "rejected") setStatus("signedIn");
    }

    restore();
  }, [loadUser]);

  // Closing the offline gap: signed in, but no user details yet. Try again
  // whenever the app comes back to the screen, and every 30 seconds meanwhile.
  const missingUser = status === "signedIn" && user === null;
  useEffect(() => {
    if (!missingUser) return;

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") loadUser();
    });
    const timer = setInterval(() => loadUser(), RETRY_EVERY_MS);

    // Stop listening once we have the user (or the user signs out).
    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, [missingUser, loadUser]);

  const signIn = useCallback(
    async (email: string, password: string, remember: boolean) => {
      const { user, token } = await login(email, password);
      if (!token) {
        throw new Error("The server didn't send a session token.");
      }

      setAuthToken(token);
      // "Remember me": keep the token after the app closes. Otherwise it only
      // lives in memory and the user signs in again next time.
      if (remember) await SecureStore.setItemAsync(TOKEN_KEY, token);

      setUser(user);
      setStatus("signedIn");
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await logout(); // tell the server, so this token stops working
    } catch {
      // Offline or already expired: sign out on this phone anyway.
    }
    await clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ status, user, signIn, signOut, refreshUser: () => loadUser() }),
    [status, user, signIn, signOut, loadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Read the session from any screen: const { user, signOut } = useAuth(); */
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
