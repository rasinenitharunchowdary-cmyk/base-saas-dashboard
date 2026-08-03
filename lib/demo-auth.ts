export const DEMO_AUTH_COOKIE = "base_demo_session_v1";

export const DEMO_CREDENTIALS = Object.freeze({
  email: "demo@base.com",
  password: "Base1234",
});

export const DEMO_AUTH_ACCOUNTS_KEY = "base_demo_accounts_v1";
export const DEMO_AUTH_SESSION_KEY = "base_demo_session_v1";

export type DemoAuthProvider = "password" | "google" | "facebook";
export type DemoSocialProvider = Exclude<DemoAuthProvider, "password">;

export type DemoSessionUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  provider: DemoAuthProvider;
};

export type DemoAuthResult = {
  ok: boolean;
  error?: string;
};

type DemoAccount = DemoSessionUser & {
  passwordHash: string | null;
  createdAt: string;
};

type DemoSessionSnapshot = {
  user: DemoSessionUser | null;
  remember: boolean;
};

const rememberedSessionLifetimeSeconds = 60 * 60 * 24 * 30;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-z0-9._-]{3,30}$/;

const seedAccountIdentity: DemoSessionUser = {
  id: "demo-user-v1",
  name: "Demo User",
  email: DEMO_CREDENTIALS.email,
  username: "demo",
  provider: "password",
};

const socialIdentities: Record<DemoSocialProvider, DemoSessionUser> = {
  google: {
    id: "demo-google-user-v1",
    name: "Alex Morgan",
    email: "alex.morgan@google.demo",
    username: "alexmorgan",
    provider: "google",
  },
  facebook: {
    id: "demo-facebook-user-v1",
    name: "Taylor Brooks",
    email: "taylor.brooks@facebook.demo",
    username: "taylorbrooks",
    provider: "facebook",
  },
};

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDemoAuthProvider(value: unknown): value is DemoAuthProvider {
  return value === "password" || value === "google" || value === "facebook";
}

export function isDemoSessionUser(value: unknown): value is DemoSessionUser {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" && value.id.length > 0 &&
    typeof value.name === "string" && value.name.length > 0 &&
    typeof value.email === "string" && value.email.length > 0 &&
    typeof value.username === "string" && value.username.length > 0 &&
    isDemoAuthProvider(value.provider)
  );
}

function sanitizeSessionUser(value: DemoSessionUser): DemoSessionUser {
  return {
    id: value.id,
    name: value.name,
    email: normalizeDemoEmail(value.email),
    username: normalizeDemoUsername(value.username),
    provider: value.provider,
  };
}

function isDemoAccount(value: unknown): value is DemoAccount {
  if (!isRecord(value) || !isDemoSessionUser(value)) return false;
  const record: Record<string, unknown> = value;
  const validHash = record.passwordHash === null || (
    typeof record.passwordHash === "string" && /^[a-f0-9]{64}$/.test(record.passwordHash)
  );
  return validHash && typeof record.createdAt === "string";
}

function sanitizeAccount(account: DemoAccount): DemoAccount {
  return {
    ...sanitizeSessionUser(account),
    passwordHash: account.passwordHash,
    createdAt: account.createdAt,
  };
}

export function normalizeDemoEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeDemoUsername(username: string) {
  return username.trim().replace(/^@+/, "").toLowerCase();
}

async function sha256(value: string) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is unavailable");
  }
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function writeAccounts(accounts: DemoAccount[]) {
  if (!isBrowser()) return;
  const sanitized = accounts.map(sanitizeAccount);
  window.localStorage.setItem(DEMO_AUTH_ACCOUNTS_KEY, JSON.stringify(sanitized));
}

function createDemoId() {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readAccounts() {
  if (!isBrowser()) return [] as DemoAccount[];
  const stored = window.localStorage.getItem(DEMO_AUTH_ACCOUNTS_KEY);
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.every(isDemoAccount)) {
      window.localStorage.removeItem(DEMO_AUTH_ACCOUNTS_KEY);
      return [];
    }
    return parsed.map(sanitizeAccount);
  } catch {
    window.localStorage.removeItem(DEMO_AUTH_ACCOUNTS_KEY);
    return [];
  }
}

export async function initializeDemoAuth() {
  if (!isBrowser()) return;
  const accounts = readAccounts();
  if (accounts.some((account) => account.email === DEMO_CREDENTIALS.email)) return;
  const passwordHash = await sha256(DEMO_CREDENTIALS.password);
  writeAccounts([
    ...accounts,
    {
      ...seedAccountIdentity,
      passwordHash,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ]);
}

function parseSession(serialized: string | null) {
  if (!serialized) return null;
  try {
    const parsed: unknown = JSON.parse(serialized);
    return isDemoSessionUser(parsed) ? sanitizeSessionUser(parsed) : null;
  } catch {
    return null;
  }
}

export function parseDemoSessionValue(serialized: string | null) {
  return parseSession(serialized);
}

export function readDemoSession(): DemoSessionSnapshot {
  if (!isBrowser()) return { user: null, remember: false };

  const rememberedRaw = window.localStorage.getItem(DEMO_AUTH_SESSION_KEY);
  const rememberedUser = parseSession(rememberedRaw);
  if (rememberedUser) return { user: rememberedUser, remember: true };
  if (rememberedRaw) window.localStorage.removeItem(DEMO_AUTH_SESSION_KEY);

  const tabRaw = window.sessionStorage.getItem(DEMO_AUTH_SESSION_KEY);
  const tabUser = parseSession(tabRaw);
  if (tabUser) return { user: tabUser, remember: false };
  if (tabRaw) window.sessionStorage.removeItem(DEMO_AUTH_SESSION_KEY);

  return { user: null, remember: false };
}

function cookieSecureAttribute() {
  return isBrowser() && window.location.protocol === "https:" ? "; Secure" : "";
}

export function encodeDemoAuthCookie(user: DemoSessionUser) {
  return encodeURIComponent(JSON.stringify(sanitizeSessionUser(user)));
}

export function decodeDemoAuthCookie(value: string | null | undefined) {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(value));
    return isDemoSessionUser(parsed) ? sanitizeSessionUser(parsed) : null;
  } catch {
    return null;
  }
}

export function setDemoAuthCookie(user: DemoSessionUser, remember: boolean) {
  if (!isBrowser()) return;
  const lifetime = remember ? `; Max-Age=${rememberedSessionLifetimeSeconds}` : "";
  document.cookie = `${DEMO_AUTH_COOKIE}=${encodeDemoAuthCookie(user)}; Path=/; SameSite=Lax${lifetime}${cookieSecureAttribute()}`;
}

export function clearDemoAuthCookie() {
  if (!isBrowser()) return;
  document.cookie = `${DEMO_AUTH_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0${cookieSecureAttribute()}`;
}

export function persistDemoSession(user: DemoSessionUser, remember: boolean) {
  if (!isBrowser()) return;
  const serialized = JSON.stringify(sanitizeSessionUser(user));
  if (remember) {
    window.localStorage.setItem(DEMO_AUTH_SESSION_KEY, serialized);
    window.sessionStorage.removeItem(DEMO_AUTH_SESSION_KEY);
  } else {
    window.sessionStorage.setItem(DEMO_AUTH_SESSION_KEY, serialized);
    window.localStorage.removeItem(DEMO_AUTH_SESSION_KEY);
  }
  setDemoAuthCookie(user, remember);
}

export function removeDemoSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(DEMO_AUTH_SESSION_KEY);
  window.sessionStorage.removeItem(DEMO_AUTH_SESSION_KEY);
  clearDemoAuthCookie();
}

export async function authenticateDemoAccount(email: string, password: string) {
  await initializeDemoAuth();
  const normalizedEmail = normalizeDemoEmail(email);
  const suppliedHash = await sha256(password);
  const account = readAccounts().find((candidate) => (
    candidate.provider === "password" &&
    candidate.email === normalizedEmail &&
    candidate.passwordHash === suppliedHash
  ));
  return account ? sanitizeSessionUser(account) : null;
}

export async function registerDemoAccount(input: {
  name: string;
  email: string;
  username: string;
  password: string;
}): Promise<{ result: DemoAuthResult; user: DemoSessionUser | null }> {
  await initializeDemoAuth();
  const name = input.name.trim().replace(/\s+/g, " ");
  const email = normalizeDemoEmail(input.email);
  const username = normalizeDemoUsername(input.username);

  if (!name) return { result: { ok: false, error: "Enter your name." }, user: null };
  if (!emailPattern.test(email)) return { result: { ok: false, error: "Enter a valid email address." }, user: null };
  if (!usernamePattern.test(username)) {
    return { result: { ok: false, error: "Username must be 3–30 characters using letters, numbers, dots, dashes, or underscores." }, user: null };
  }
  if (input.password.length < 8) return { result: { ok: false, error: "Password must be at least 8 characters." }, user: null };

  const accounts = readAccounts();
  if (accounts.some((account) => account.email === email)) {
    return { result: { ok: false, error: "An account with this email already exists." }, user: null };
  }
  if (accounts.some((account) => account.username === username)) {
    return { result: { ok: false, error: "This username is already in use." }, user: null };
  }

  const user: DemoSessionUser = {
    id: createDemoId(),
    name,
    email,
    username,
    provider: "password",
  };
  const account: DemoAccount = {
    ...user,
    passwordHash: await sha256(input.password),
    createdAt: new Date().toISOString(),
  };
  writeAccounts([...accounts, account]);
  return { result: { ok: true }, user };
}

export async function createDemoProviderSession(provider: DemoSocialProvider) {
  await initializeDemoAuth();
  const identity = socialIdentities[provider];
  const accounts = readAccounts();
  const existing = accounts.find((account) => account.id === identity.id);
  if (!existing) {
    const [emailName, emailDomain] = identity.email.split("@");
    let email = identity.email;
    let emailSuffix = 1;
    while (accounts.some((account) => account.email === email)) {
      email = `${emailName}+${provider}${emailSuffix}@${emailDomain}`;
      emailSuffix += 1;
    }
    let username = identity.username;
    let usernameSuffix = 1;
    while (accounts.some((account) => account.username === username)) {
      username = `${identity.username}.${provider}${usernameSuffix}`;
      usernameSuffix += 1;
    }
    const uniqueIdentity = { ...identity, email, username };
    writeAccounts([
      ...accounts,
      {
        ...uniqueIdentity,
        passwordHash: null,
        createdAt: new Date().toISOString(),
      },
    ]);
    return uniqueIdentity;
  }
  return sanitizeSessionUser(existing);
}

export async function requestDemoRecovery(email: string): Promise<DemoAuthResult> {
  normalizeDemoEmail(email);
  await Promise.resolve();
  return { ok: true };
}
