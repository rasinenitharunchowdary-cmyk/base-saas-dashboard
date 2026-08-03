import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import ts from "typescript";

const protectedRoutes = [
  ["/", "Dashboard"],
  ["/analytics", "Product Analytics"],
  ["/customers", "Customer List"],
  ["/invoices", "Invoice List"],
  ["/invoices/new", "Create New Invoice"],
  ["/schedule", "Schedule List"],
  ["/tasks", "Task Preview"],
  ["/calendar", "Calendar"],
  ["/messages", "Message"],
  ["/notifications", "Notification"],
  ["/settings", "Settings"],
  ["/billing", "Invoice List"],
  ["/overview", "Dashboard"],
  ["/projects", "Task Preview"],
];

const authenticationRoutes = [
  ["/login", "Log in"],
  ["/signup", "Sign Up"],
  ["/recover", "Recover"],
  ["/success", "Your account successfully created."],
];

const demoSessionCookie = `base_demo_session_v1=${encodeURIComponent(JSON.stringify({
  id: "route-test-user",
  name: "Route Test User",
  email: "route.test@base.demo",
  username: "routetest",
  provider: "password",
}))}`;

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const appPort = 43197;
const appOrigin = `http://127.0.0.1:${appPort}`;
let appServer;
let appServerOutput = "";

before(async () => {
  appServer = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(appPort)],
    {
      cwd: projectRoot,
      env: { ...process.env, NODE_ENV: "production" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  appServer.stdout.on("data", (chunk) => {
    appServerOutput += chunk.toString();
  });
  appServer.stderr.on("data", (chunk) => {
    appServerOutput += chunk.toString();
  });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (appServer.exitCode !== null) {
      throw new Error(`Next.js exited before becoming ready.\n${appServerOutput}`);
    }

    try {
      const response = await fetch(`${appOrigin}/login`, { redirect: "manual" });
      if (response.status === 200) return;
    } catch {
      // The server socket may not be listening during the first few attempts.
    }

    await delay(100);
  }

  throw new Error(`Next.js did not become ready.\n${appServerOutput}`);
});

after(async () => {
  if (!appServer || appServer.exitCode !== null) return;

  appServer.kill("SIGTERM");
  await Promise.race([once(appServer, "exit"), delay(3_000)]);
  if (appServer.exitCode === null) appServer.kill("SIGKILL");
});

async function render(pathname, { authenticated = false } = {}) {
  return fetch(`${appOrigin}${pathname}`, {
    headers: {
      accept: "text/html",
      ...(authenticated ? { cookie: demoSessionCookie } : {}),
    },
    redirect: "manual",
  });
}

test("a guest is sent to the Figma login screen before the dashboard", async () => {
  const response = await render("/");
  assert.ok([302, 303, 307, 308].includes(response.status), `expected an auth redirect, received ${response.status}`);
  const location = response.headers.get("location");
  assert.ok(location, "auth redirect should include a destination");
  assert.equal(new URL(location, "https://base-dashboard.example").pathname, "/login");
});

test("authenticated product routes render successfully", async () => {
  for (const [pathname, expectedCopy] of protectedRoutes) {
    const response = await render(pathname, { authenticated: true });
    assert.equal(response.status, 200, `${pathname} should return 200`);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
    const html = await response.text();
    assert.match(html, /Base — SaaS Dashboard/);
    assert.ok(html.includes(expectedCopy), `${pathname} should include ${expectedCopy}`);
    assert.doesNotMatch(html, /Your site is taking shape/);
  }
});

test("all Figma authentication routes render successfully", async () => {
  for (const [pathname, expectedCopy] of authenticationRoutes) {
    const response = await render(pathname);
    assert.equal(response.status, 200, `${pathname} should return 200`);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
    const html = await response.text();
    assert.match(html, /Base — SaaS Dashboard/);
    assert.ok(html.includes(expectedCopy), `${pathname} should include ${expectedCopy}`);
  }
});

test("navigation manifest maps to real route files", async () => {
  const shell = await readFile(new URL("../components/base/base-shell.tsx", import.meta.url), "utf8");
  const expectedNavigation = [
    ["Dashboard", "app/(dashboard)/page.tsx"],
    ["Analytics", "app/(dashboard)/analytics/page.tsx"],
    ["Invoice", "app/(dashboard)/invoices/page.tsx"],
    ["Schedule", "app/(dashboard)/schedule/page.tsx"],
    ["Calendar", "app/(dashboard)/calendar/page.tsx"],
    ["Messages", "app/(dashboard)/messages/page.tsx"],
    ["Notification", "app/(dashboard)/notifications/page.tsx"],
    ["Settings", "app/(dashboard)/settings/page.tsx"],
  ];

  for (const [label, routeFile] of expectedNavigation) {
    assert.match(shell, new RegExp(`label: "${label}"`));
    await access(new URL(`../${routeFile}`, import.meta.url));
  }
});

test("brand asset, application metadata, and responsive styles are connected", async () => {
  const [layout, shell, logo, packageJson, css] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/base/base-shell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/logo.svg", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /Base — SaaS Dashboard/);
  assert.match(layout, /\/logo\.svg/);
  assert.match(layout, /data-scroll-behavior="smooth"/);
  assert.match(shell, /src="\/logo\.svg"/);
  assert.match(shell, /aria-label="Base dashboard home"/);
  assert.match(shell, /loading="eager"/);
  assert.match(logo, /viewBox="0 0 192 192"/);
  assert.match(logo, /fill="#6158f5"/);
  assert.match(logo, /Three connected white nodes on a violet circle/);
  assert.doesNotMatch(layout, /Starter Project|Lumio/);
  assert.doesNotMatch(layout, /next\/font\/google/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(css, /base-logo-(line|dot)/);
  assert.match(css, /--base-primary/);
  assert.match(css, /@media \(max-width: 760px\)/);
  await Promise.all([400, 500, 600, 700].map((weight) => (
    access(new URL(`../public/fonts/poppins-${weight}.woff2`, import.meta.url))
  )));
});

test("authentication screens use the supplied workspace illustration", async () => {
  const [authPage, artwork, css] = await Promise.all([
    readFile(new URL("../components/base/auth-page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/auth-workspace-illustration.png", import.meta.url)),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(authPage, /src="\/auth-workspace-illustration\.png"/);
  assert.match(authPage, /width={1518}/);
  assert.match(authPage, /height={1210}/);
  assert.match(authPage, /alt=""/);
  assert.equal(artwork.readUInt32BE(16), 1518);
  assert.equal(artwork.readUInt32BE(20), 1210);
  assert.match(css, /\.base-auth-illustration\s*{[^}]*object-fit:\s*contain/s);
  assert.doesNotMatch(authPage, /base-illus-/);
  assert.doesNotMatch(css, /\.base-illus-/);
});

test("the account-created screen uses the canonical success illustration", async () => {
  const [authPage, artwork, css] = await Promise.all([
    readFile(new URL("../components/base/auth-page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/account-success.svg", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(authPage, /src="\/account-success\.svg"/);
  assert.match(authPage, /className="base-success-graphic"/);
  assert.doesNotMatch(authPage, /ThumbsUp/);
  assert.match(artwork, /viewBox="0 0 320 320"/);
  assert.match(artwork, /A violet thumbs-up surrounded by colorful celebration marks/);
  assert.match(artwork, /#6158f5/);
  assert.doesNotMatch(css, /\.base-success-graphic i/);
});

test("scroll controls and reusable toast feedback are connected", async () => {
  const [
    rootLayout,
    shell,
    toastProvider,
    scrollControl,
    overlayLock,
    css,
    invoiceCss,
    planningCss,
    messages,
    invoices,
    customers,
    tasks,
    utilities,
    eslintConfig,
  ] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/base/base-shell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/base/toast-provider.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/base/scroll-to-top.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/base/use-overlay-scroll-lock.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../components/base/invoices-messages.css", import.meta.url), "utf8"),
    readFile(new URL("../components/base/planning-product.css", import.meta.url), "utf8"),
    readFile(new URL("../components/base/messages-page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/base/invoices-page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/base/customers-page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/base/tasks-page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/base/utility-pages.tsx", import.meta.url), "utf8"),
    readFile(new URL("../eslint.config.mjs", import.meta.url), "utf8"),
  ]);

  assert.match(rootLayout, /ToastProvider/);
  assert.match(toastProvider, /role="region" aria-label="Notifications"/);
  assert.match(toastProvider, /role={toast\.tone === "error" \? "alert" : "status"}/);
  assert.match(toastProvider, /\.slice\(-3\)/);
  assert.match(toastProvider, /onMouseEnter/);
  assert.match(toastProvider, /onFocusCapture/);
  assert.match(scrollControl, /window\.scrollY > 360/);
  assert.match(scrollControl, /window\.scrollTo/);
  assert.match(shell, /<ScrollToTop \/>/);
  assert.match(shell, /aria-expanded={mobileOpen}/);
  assert.match(shell, /useOverlayScrollLock\(mobileOpen/);
  assert.match(overlayLock, /document\.documentElement\.style\.overflow = "hidden"/);
  assert.match(overlayLock, /document\.body\.style\.overflow = "hidden"/);
  assert.match(overlayLock, /event\.key === "Escape"/);
  assert.match(css, /\.base-nav\s*{[^}]*overflow-y:\s*auto/s);
  assert.match(css, /\.base-toast-region/);
  assert.match(css, /\.base-global-toast/);
  assert.match(css, /\.base-scroll-top/);
  assert.match(invoiceCss, /\.base-invoices-table-wrap\s*{[^}]*overflow-x:\s*auto/s);
  assert.match(invoiceCss, /max-height:\s*calc\(100dvh - 40px\)/);
  assert.match(planningCss, /\.base-calendar-content\s*{[^}]*overflow-x:\s*auto/s);
  assert.doesNotMatch(invoiceCss, /\.base-message-toast/);
  assert.doesNotMatch(planningCss, /\.base-toast\s*{/);
  assert.match(messages, /scrollTo/);
  assert.match(messages, /thread\.scrollHeight/);
  assert.match(messages, /useToast/);
  assert.match(invoices, /useToast/);
  assert.match(customers, /useToast/);
  assert.match(tasks, /useToast/);
  assert.match(utilities, /useToast/);
  assert.match(eslintConfig, /\.netlify\/\*\*/);
});

test("authentication screens, server gate, session provider, and logout are connected", async () => {
  const [rootLayout, dashboardLayout, authPage, authSession, authCore, shell] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(dashboard)/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/base/auth-page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/base/auth-session.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/demo-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/base/base-shell.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(rootLayout, /AuthSessionProvider/);
  assert.match(dashboardLayout, /cookies\(\)/);
  assert.match(dashboardLayout, /redirect\("\/login"\)/);
  assert.match(authPage, /signIn\(/);
  assert.match(authPage, /signUp\(/);
  assert.match(authPage, /signInWithProvider\(/);
  assert.match(authPage, /recover\(/);
  assert.match(authSession, /AuthSessionContext/);
  assert.match(authCore, /localStorage/);
  assert.match(authCore, /sessionStorage/);
  assert.match(authCore, /crypto\.subtle\.digest\("SHA-256"/);
  assert.match(authCore, /SameSite=Lax/);
  assert.match(shell, /signOut\(\)/);
  assert.match(shell, /router\.replace\("\/login"\)/);
});

test("demo signup, hashed-password login, remembered sessions, and logout work", async () => {
  class MemoryStorage {
    values = new Map();

    getItem(key) {
      return this.values.get(key) ?? null;
    }

    setItem(key, value) {
      this.values.set(key, String(value));
    }

    removeItem(key) {
      this.values.delete(key);
    }
  }

  const localStorage = new MemoryStorage();
  const sessionStorage = new MemoryStorage();
  globalThis.window = { localStorage, sessionStorage, location: { protocol: "https:" } };
  globalThis.document = { cookie: "" };

  try {
    const source = await readFile(new URL("../lib/demo-auth.ts", import.meta.url), "utf8");
    const javascript = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const auth = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);

    await auth.initializeDemoAuth();
    const demoUser = await auth.authenticateDemoAccount(auth.DEMO_CREDENTIALS.email, auth.DEMO_CREDENTIALS.password);
    assert.equal(demoUser?.email, auth.DEMO_CREDENTIALS.email);
    assert.equal(await auth.authenticateDemoAccount(auth.DEMO_CREDENTIALS.email, "wrong-password"), null);

    const registration = await auth.registerDemoAccount({
      name: "Akash Barik",
      email: "akash@example.com",
      username: "akash.barik",
      password: "SecureDemo123",
    });
    assert.equal(registration.result.ok, true);
    assert.ok(registration.user);
    assert.equal(registration.user?.username, "akash.barik");
    assert.doesNotMatch(localStorage.getItem(auth.DEMO_AUTH_ACCOUNTS_KEY) ?? "", /SecureDemo123/);
    assert.equal((await auth.authenticateDemoAccount("AKASH@example.com", "SecureDemo123"))?.name, "Akash Barik");

    const duplicate = await auth.registerDemoAccount({
      name: "Duplicate",
      email: "akash@example.com",
      username: "different-user",
      password: "SecureDemo456",
    });
    assert.equal(duplicate.result.ok, false);

    auth.persistDemoSession(registration.user, true);
    assert.equal(auth.readDemoSession().remember, true);
    assert.match(document.cookie, /base_demo_session_v1=/);
    assert.match(document.cookie, /Max-Age=/);

    auth.removeDemoSession();
    assert.equal(auth.readDemoSession().user, null);
    assert.match(document.cookie, /Max-Age=0/);
  } finally {
    delete globalThis.window;
    delete globalThis.document;
  }
});
