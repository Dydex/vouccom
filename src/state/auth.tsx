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
  logoutAll,
  setAuthToken,
  type User,
} from "@/lib/api";
import { unregisterFromPush } from "@/lib/push";
import { queryClient } from "@/lib/query-client";

const TOKEN_KEY = "vouccom.session-token";

/** Retry interval while signed in without user details (e.g. started offline). */
const RETRY_EVERY_MS = 30_000;

/** Max time the startup check holds the splash screen before continuing offline. */
const STARTUP_TIMEOUT_MS = 5_000;

type AuthStatus = "restoring" | "signedOut" | "signedIn";

type LoadResult = "loaded" | "rejected" | "unreachable" | "busy";

type AuthContextValue = {
  status: AuthStatus;
  /** Null until loaded; may stay null while offline. */
  user: User | null;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<unknown>;
  /** Replaces the user with one the server just sent back. */
  updateUser: (user: User) => void;
  /** Ends every session on every device. Throws (and stays signed in) on failure. */
  signOutEverywhere: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("restoring");
  const [user, setUser] = useState<User | null>(null);

  const clearSession = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAuthToken(null);
    // Don't show the next account this user's data.
    queryClient.clear();
    setUser(null);
    setStatus("signedOut");
  }, []);

  // Only a 401 signs the user out; network errors keep the session.
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
        return "unreachable";
      } finally {
        loadingUser.current = false;
      }
    },
    [clearSession],
  );

  // Restore the saved session on launch.
  useEffect(() => {
    async function restore() {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        setStatus("signedOut");
        return;
      }

      setAuthToken(token);
      const result = await loadUser(STARTUP_TIMEOUT_MS);
      // Stay "restoring" until checked so an expired token never shows Home.
      if (result !== "rejected") setStatus("signedIn");
    }

    restore();
  }, [loadUser]);

  // Retry loading the user when the app returns to the foreground, and periodically.
  const missingUser = status === "signedIn" && user === null;
  useEffect(() => {
    if (!missingUser) return;

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") loadUser();
    });
    const timer = setInterval(() => loadUser(), RETRY_EVERY_MS);

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
      // Without "Remember me" the token is kept in memory only.
      if (remember) await SecureStore.setItemAsync(TOKEN_KEY, token);

      setUser(user);
      setStatus("signedIn");
    },
    [],
  );

  const signOut = useCallback(async () => {
    // Needs the session, so before logging out.
    await unregisterFromPush();
    try {
      await logout(); // tell the server, so this token stops working
    } catch {
      // Sign out locally even if the server can't be reached.
    }
    await clearSession();
  }, [clearSession]);

  const signOutEverywhere = useCallback(async () => {
    // Needs the session, so before ending it.
    await unregisterFromPush();
    await logoutAll();
    await clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      status,
      user,
      signIn,
      signOut,
      refreshUser: () => loadUser(),
      updateUser: setUser,
      signOutEverywhere,
    }),
    [status, user, signIn, signOut, loadUser, signOutEverywhere],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
