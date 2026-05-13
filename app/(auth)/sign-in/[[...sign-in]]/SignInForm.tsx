"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSignIn } from "@clerk/nextjs";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";
import { routes } from "@/lib/config/routes";

export function SignInForm() {
  const t = useTranslations("signInPage");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    emailRef.current?.focus({ preventScroll: true });
  }, []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.length >= 6;
  const formValid = emailValid && passwordValid;

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn || submitting) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: routes.admin.dashboard,
      });
    } catch {
      setFormError(t("signInError"));
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setFormError(null);
    if (!formValid || submitting || !isLoaded || !signIn) return;

    setSubmitting(true);
    try {
      const attempt = await signIn.create({
        identifier: email.trim(),
        password,
      });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        setDone(true);
        // Brief pause so the success state is visible, then redirect
        setTimeout(() => router.push(routes.admin.dashboard), 1000);
      } else {
        setFormError(t("signInError"));
        setSubmitting(false);
      }
    } catch {
      setFormError(t("signInError"));
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center py-2 text-center [animation:rise_360ms_ease_both]">
        <span
          className="mb-[18px] inline-flex h-14 w-14 items-center justify-center rounded-full text-primary"
          style={{
            background: "color-mix(in oklch, var(--primary) 10%, transparent)",
          }}
        >
          <Check className="h-[22px] w-[22px]" strokeWidth={2.2} />
        </span>
        <h2 className="mb-2 text-[22px] font-medium tracking-tight">
          {t("successTitle")}
        </h2>
        <p className="mb-[18px] max-w-[28ch] text-sm text-muted-foreground">
          {t("successDesc")}
        </p>
        <button
          type="button"
          onClick={() => router.push(routes.admin.dashboard)}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90 active:translate-y-[0.5px]"
        >
          {t("continueBtn")}
          <ArrowRight className="h-4 w-4" data-dir-flip />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-[18px]"
    >
      {/* OAuth — Google */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={submitting}
        className="inline-flex h-10 w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-card text-sm font-medium transition-colors hover:bg-accent active:translate-y-[0.5px] disabled:cursor-progress disabled:opacity-55"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.5c-.25 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.75-6-6.2s2.7-6.2 6-6.2c1.9 0 3.15.8 3.85 1.5l2.6-2.5C16.85 3.3 14.7 2.3 12 2.3 6.85 2.3 2.7 6.45 2.7 12s4.15 9.7 9.3 9.7c5.4 0 8.95-3.8 8.95-9.15 0-.6-.05-1.05-.15-1.5H12Z"
          />
        </svg>
        {t("continueWithGoogle")}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>{t("dividerText")}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-[13px] font-medium tracking-tight"
        >
          {t("emailLabel")}
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.6}
          />
          <input
            id="email"
            ref={emailRef}
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((x) => ({ ...x, email: true }))}
            className={
              "h-11 w-full rounded-lg border bg-card ps-10 pe-3.5 text-sm transition-shadow outline-none placeholder:text-muted-foreground/60 focus:bg-background focus:ring-4 focus:ring-foreground/[0.08] " +
              (touched.email && !emailValid
                ? "border-destructive focus:border-destructive focus:ring-destructive/15"
                : "border-border hover:border-foreground/30 focus:border-foreground")
            }
          />
        </div>
        {touched.email && !emailValid && (
          <span className="text-xs text-destructive">{t("emailInvalid")}</span>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="password"
            className="text-[13px] font-medium tracking-tight"
          >
            {t("passwordLabel")}
          </label>
          <a
            href="#"
            tabIndex={-1}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t("forgot")}
          </a>
        </div>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.6}
          />
          <input
            id="password"
            type={showPwd ? "text" : "password"}
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((x) => ({ ...x, password: true }))}
            className={
              "h-11 w-full rounded-lg border bg-card ps-10 pe-11 text-sm transition-shadow outline-none placeholder:text-muted-foreground/60 focus:bg-background focus:ring-4 focus:ring-foreground/[0.08] " +
              (touched.password && !passwordValid
                ? "border-destructive focus:border-destructive focus:ring-destructive/15"
                : "border-border hover:border-foreground/30 focus:border-foreground")
            }
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPwd((v) => !v)}
            aria-label={showPwd ? t("hidePassword") : t("showPassword")}
            className="absolute end-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {showPwd ? (
              <EyeOff className="h-4 w-4" strokeWidth={1.6} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={1.6} />
            )}
          </button>
        </div>
        {touched.password && !passwordValid && (
          <span className="text-xs text-destructive">{t("passwordShort")}</span>
        )}
      </div>

      {/* Remember */}
      <label className="inline-flex cursor-pointer items-center gap-2.5 text-[13px] text-muted-foreground">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={
            "inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors " +
            (remember
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-card")
          }
        >
          <Check
            className="h-3 w-3"
            strokeWidth={2.4}
            style={{ opacity: remember ? 1 : 0 }}
          />
        </span>
        <span>{t("keepSignedIn")}</span>
      </label>

      {formError && (
        <p className="text-xs text-destructive" role="alert">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90 active:translate-y-[0.5px] disabled:cursor-progress disabled:opacity-55"
      >
        {submitting ? (
          <>
            <span
              aria-hidden
              className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-r-transparent"
            />
            {t("signingIn")}
          </>
        ) : (
          <>
            {tNav("signIn")}
            <ArrowRight className="h-4 w-4" data-dir-flip />
          </>
        )}
      </button>

      <style>{`
        @keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      `}</style>
    </form>
  );
}
