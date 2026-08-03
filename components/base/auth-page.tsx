"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { DEMO_CREDENTIALS } from "../../lib/demo-auth";
import { useAuthSession } from "./auth-session";
import { BaseLogo } from "./base-shell";
import { useToast } from "./toast-provider";

export type AuthMode = "signup" | "login" | "recover" | "success";

type Provider = "google" | "facebook";
type PendingAction = "form" | Provider | null;

type AuthMessage = {
  kind: "error" | "status";
  text: string;
} | null;

function getSafeNextPath() {
  if (typeof window === "undefined") return "/";
  const candidate = new URLSearchParams(window.location.search).get("next");
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) {
    return "/";
  }

  try {
    const target = new URL(candidate, window.location.origin);
    if (target.origin !== window.location.origin) return "/";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/";
  }
}

function errorText(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function SocialButtons({
  disabled,
  pendingProvider,
  onProvider,
}: {
  disabled: boolean;
  pendingProvider: Provider | null;
  onProvider: (provider: Provider) => void;
}) {
  return (
    <div className="base-social-buttons" aria-label="Social sign in options">
      <button
        type="button"
        disabled={disabled}
        aria-label="Continue with Google"
        onClick={() => onProvider("google")}
      >
        <b className="base-google-g" aria-hidden="true">G</b>
        {pendingProvider === "google" ? "Connecting…" : "Google"}
      </button>
      <button
        type="button"
        disabled={disabled}
        aria-label="Continue with Facebook"
        onClick={() => onProvider("facebook")}
      >
        <b className="base-facebook-f" aria-hidden="true">f</b>
        {pendingProvider === "facebook" ? "Connecting…" : "Facebook"}
      </button>
    </div>
  );
}

function AuthIllustration() {
  return (
    <Image
      className="base-auth-illustration"
      src="/auth-workspace-illustration.png"
      alt=""
      width={1518}
      height={1210}
      sizes="(max-width: 960px) 1px, (max-width: 1430px) calc(90vw - 387px), 900px"
      loading="eager"
    />
  );
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { ready, user, signIn, signUp, signInWithProvider, recover } = useAuthSession();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [recoverSent, setRecoverSent] = useState(false);
  const [recoveredEmail, setRecoveredEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [message, setMessage] = useState<AuthMessage>(null);

  const signup = mode === "signup";
  const pending = pendingAction !== null;
  const pendingProvider = pendingAction === "google" || pendingAction === "facebook" ? pendingAction : null;

  function setError(text: string) {
    setMessage({ kind: "error", text });
  }

  function useDemoCredentials() {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setMessage({ kind: "status", text: "Demo credentials are ready. Select Log in to continue." });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || pending) return;

    const normalizedEmail = email.trim().toLowerCase();
    setMessage(null);

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (mode === "signup") {
      const normalizedName = fullName.trim();
      const normalizedUsername = username.trim();
      if (normalizedName.length < 2) {
        setError("Enter your full name.");
        return;
      }
      if (!/^[a-zA-Z0-9._-]{3,30}$/.test(normalizedUsername)) {
        setError("Username must be 3–30 characters using letters, numbers, dots, dashes, or underscores.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      setPendingAction("form");
      setMessage({ kind: "status", text: "Creating your account…" });
      try {
        const result = await signUp({
          name: normalizedName,
          email: normalizedEmail,
          username: normalizedUsername,
          password,
        });
        if (!result.ok) {
          setError(result.error ?? "We couldn’t create your account. Please try again.");
          return;
        }
        router.push("/success");
      } catch (error) {
        setError(errorText(error, "We couldn’t create your account. Please try again."));
      } finally {
        setPendingAction(null);
      }
      return;
    }

    if (mode === "login") {
      if (!password) {
        setError("Enter your password.");
        return;
      }

      setPendingAction("form");
      setMessage({ kind: "status", text: "Signing you in…" });
      try {
        const result = await signIn({ email: normalizedEmail, password, remember });
        if (!result.ok) {
          setError(result.error ?? "The email or password is incorrect.");
          return;
        }
        showToast("Signed in successfully.", { title: "Welcome back" });
        router.push(getSafeNextPath());
      } catch (error) {
        setError(errorText(error, "We couldn’t sign you in. Please try again."));
      } finally {
        setPendingAction(null);
      }
      return;
    }

    if (mode === "recover") {
      setPendingAction("form");
      setMessage({ kind: "status", text: "Preparing your reset link…" });
      try {
        const result = await recover(normalizedEmail);
        if (!result.ok) {
          setError(result.error ?? "We couldn’t send the reset link. Please try again.");
          return;
        }
        setRecoveredEmail(normalizedEmail);
        setRecoverSent(true);
        setMessage(null);
      } catch (error) {
        setError(errorText(error, "We couldn’t send the reset link. Please try again."));
      } finally {
        setPendingAction(null);
      }
    }
  }

  async function continueWithProvider(provider: Provider) {
    if (!ready || pending) return;
    setPendingAction(provider);
    setMessage({ kind: "status", text: `Connecting to ${provider === "google" ? "Google" : "Facebook"}…` });
    try {
      const result = await signInWithProvider(provider);
      if (!result.ok) {
        setError(result.error ?? `We couldn’t connect to ${provider === "google" ? "Google" : "Facebook"}.`);
        return;
      }
      if (!signup) {
        const providerName = provider === "google" ? "Google" : "Facebook";
        showToast(`Signed in with ${providerName}.`, { title: "Welcome back" });
      }
      router.push(signup ? "/success" : getSafeNextPath());
    } catch (error) {
      setError(errorText(error, "Social sign in couldn’t be completed. Please try again."));
    } finally {
      setPendingAction(null);
    }
  }

  if (mode === "recover") {
    return (
      <main className="base-auth-centered">
        <section className="base-auth-card" aria-busy={pending}>
          <BaseLogo compact />
          <h1>Recover</h1>
          {recoverSent ? (
            <div className="base-recover-success" role="status">
              <span><Mail size={23} /></span>
              <strong>Reset request prepared</strong>
              <p>Demo reset instructions are ready for {recoveredEmail}. No external email is sent in this frontend preview.</p>
              <Link className="base-primary-button" href="/login">Back to Log in</Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label className="base-form-field">
                <span>Email Address</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  disabled={!ready || pending}
                  value={email}
                  placeholder="example@gmail.com"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              {message ? (
                <p className={`base-auth-message ${message.kind === "error" ? "is-error" : ""}`} role={message.kind === "error" ? "alert" : "status"}>
                  {message.text}
                </p>
              ) : null}
              <button className="base-primary-button base-full-button" type="submit" disabled={!ready || pending}>
                {pendingAction === "form" ? "Sending reset link…" : "Reset Your Password"}
              </button>
            </form>
          )}
        </section>
      </main>
    );
  }

  if (mode === "success") {
    return (
      <main className="base-auth-centered">
        <section className="base-auth-card base-success-card">
          <Image
            className="base-success-graphic"
            src="/account-success.svg"
            alt=""
            width={320}
            height={320}
            loading="eager"
            unoptimized
          />
          <h1>Your account successfully created.</h1>
          <button
            className="base-primary-button"
            type="button"
            disabled={!ready}
            onClick={() => router.push(user ? "/" : "/login")}
          >
            {ready ? "Go to Home" : "Loading…"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="base-auth-split">
      <section className="base-auth-form-column">
        <div className="base-auth-form-inner" aria-busy={pending}>
          <BaseLogo compact />
          <h1>{signup ? "Sign Up" : "Log in"}</h1>
          <SocialButtons
            disabled={!ready || pending}
            pendingProvider={pendingProvider}
            onProvider={continueWithProvider}
          />
          <div className="base-auth-divider"><span>Or</span></div>
          <form onSubmit={submit}>
            {signup ? (
              <>
                <label className="base-form-field">
                  <span>Full Name</span>
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    disabled={!ready || pending}
                    value={fullName}
                    placeholder="Jiangyu"
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </label>
                <label className="base-form-field">
                  <span>Email Address</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    disabled={!ready || pending}
                    value={email}
                    placeholder="example@gmail.com"
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <label className="base-form-field">
                  <span>Username</span>
                  <input
                    name="username"
                    autoComplete="username"
                    minLength={3}
                    maxLength={30}
                    pattern="[a-zA-Z0-9._-]+"
                    required
                    disabled={!ready || pending}
                    value={username}
                    placeholder="johnkevine4362"
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </label>
              </>
            ) : (
              <label className="base-form-field">
                <span>Email Address</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  disabled={!ready || pending}
                  value={email}
                  placeholder="example@gmail.com"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
            )}
            <label className="base-form-field base-password-field">
              <span>Password</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete={signup ? "new-password" : "current-password"}
                required
                minLength={signup ? 8 : 1}
                disabled={!ready || pending}
                value={password}
                placeholder="•••••••••"
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                disabled={!ready || pending}
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </label>
            {!signup ? (
              <>
                <div className="base-auth-options">
                  <label>
                    <input
                      type="checkbox"
                      name="remember"
                      checked={remember}
                      disabled={!ready || pending}
                      onChange={(event) => setRemember(event.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link href="/recover">Reset Password?</Link>
                </div>
                <button className="base-demo-credentials" type="button" disabled={!ready || pending} onClick={useDemoCredentials}>
                  Demo: {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
                </button>
              </>
            ) : (
              <label className="base-auth-terms">
                <input type="checkbox" name="terms" required disabled={!ready || pending} />
                <span>I agree to the <a href="#terms">Terms &amp; Conditions</a></span>
              </label>
            )}
            {message ? (
              <p className={`base-auth-message ${message.kind === "error" ? "is-error" : ""}`} role={message.kind === "error" ? "alert" : "status"}>
                {message.text}
              </p>
            ) : null}
            <button className="base-primary-button base-full-button" type="submit" disabled={!ready || pending}>
              {pendingAction === "form" ? (signup ? "Creating account…" : "Logging in…") : signup ? "Create Account" : "Log in"}
            </button>
          </form>
          <p className="base-auth-switch">
            {signup ? "Already have an account?" : "Don’t have an account?"}{" "}
            <Link href={signup ? "/login" : "/signup"}>{signup ? "Log in" : "Sign Up"}</Link>
          </p>
        </div>
      </section>
      <section className="base-auth-art-column">
        <AuthIllustration />
      </section>
    </main>
  );
}

export default AuthPage;
