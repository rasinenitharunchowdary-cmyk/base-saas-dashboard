"use client";

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  authenticateDemoAccount,
  clearDemoAuthCookie,
  createDemoProviderSession,
  DEMO_AUTH_ACCOUNTS_KEY,
  DEMO_AUTH_SESSION_KEY,
  type DemoAuthResult,
  type DemoSessionUser,
  type DemoSocialProvider,
  initializeDemoAuth,
  persistDemoSession,
  readDemoSession,
  registerDemoAccount,
  removeDemoSession,
  requestDemoRecovery,
  setDemoAuthCookie,
} from "@/lib/demo-auth";

type SignInInput = {
  email: string;
  password: string;
  remember: boolean;
};

type SignUpInput = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type AuthSessionValue = {
  ready: boolean;
  user: DemoSessionUser | null;
  signIn: (input: SignInInput) => Promise<DemoAuthResult>;
  signUp: (input: SignUpInput) => Promise<DemoAuthResult>;
  signInWithProvider: (provider: DemoSocialProvider) => Promise<DemoAuthResult>;
  recover: (email: string) => Promise<DemoAuthResult>;
  signOut: () => void;
};

const AuthSessionContext = createContext<AuthSessionValue | null>(null);

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<DemoSessionUser | null>(null);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        await initializeDemoAuth();
        const session = readDemoSession();
        if (!active) return;
        setUser(session.user);
        if (session.user) setDemoAuthCookie(session.user, session.remember);
        else clearDemoAuthCookie();
      } catch {
        if (!active) return;
        removeDemoSession();
        setUser(null);
      } finally {
        if (active) setReady(true);
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.storageArea !== window.localStorage) return;
      if (event.key === DEMO_AUTH_ACCOUNTS_KEY) {
        void initializeDemoAuth();
        return;
      }
      if (event.key !== DEMO_AUTH_SESSION_KEY) return;
      const session = readDemoSession();
      setUser(session.user);
      if (session.user) setDemoAuthCookie(session.user, session.remember);
      else clearDemoAuthCookie();
    }

    void initialize();
    window.addEventListener("storage", handleStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const signIn = useCallback(async ({ email, password, remember }: SignInInput): Promise<DemoAuthResult> => {
    try {
      const sessionUser = await authenticateDemoAccount(email, password);
      if (!sessionUser) return { ok: false, error: "Incorrect email or password." };
      persistDemoSession(sessionUser, remember);
      setUser(sessionUser);
      return { ok: true };
    } catch {
      return { ok: false, error: "Demo sign-in is unavailable in this browser." };
    }
  }, []);

  const signUp = useCallback(async (input: SignUpInput): Promise<DemoAuthResult> => {
    try {
      const { result, user: registeredUser } = await registerDemoAccount(input);
      if (!result.ok || !registeredUser) return result;
      persistDemoSession(registeredUser, false);
      setUser(registeredUser);
      return { ok: true };
    } catch {
      return { ok: false, error: "Unable to create the demo account in this browser." };
    }
  }, []);

  const signInWithProvider = useCallback(async (provider: DemoSocialProvider) => {
    try {
      const providerUser = await createDemoProviderSession(provider);
      persistDemoSession(providerUser, false);
      setUser(providerUser);
      return { ok: true };
    } catch {
      removeDemoSession();
      setUser(null);
      return { ok: false, error: "Social demo sign-in is unavailable in this browser." };
    }
  }, []);

  const recover = useCallback(async (email: string) => requestDemoRecovery(email), []);

  const signOut = useCallback(() => {
    removeDemoSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthSessionValue>(() => ({
    ready,
    user,
    signIn,
    signUp,
    signInWithProvider,
    recover,
    signOut,
  }), [ready, recover, signIn, signInWithProvider, signOut, signUp, user]);

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error("useAuthSession must be used within an AuthSessionProvider");
  }
  return context;
}
