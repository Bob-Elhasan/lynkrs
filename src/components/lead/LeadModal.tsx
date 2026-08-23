"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  getCountries,
  getCountryCallingCode,
  isSupportedCountry,
  type CountryCode,
} from "libphonenumber-js/min";
import { checkBusinessEmail, checkName, checkPhone, checkText } from "./validate";

const ENDPOINT = process.env.NEXT_PUBLIC_LEAD_ENDPOINT ?? "";
const DRAFT_KEY = "lynkrs.lead.draft";

type Values = {
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  email: string;
  phone: string;
};

const EMPTY: Values = { firstName: "", lastName: "", organization: "", title: "", email: "", phone: "" };

const STEPS = [
  {
    id: "you",
    label: "You",
    heading: "Who are we speaking to?",
    note: "We answer every enquiry ourselves, so it helps to know your name first.",
  },
  {
    id: "work",
    label: "Work",
    heading: "And where do you do it?",
    note: "This tells us which of our people should be on the first call.",
  },
  {
    id: "reach",
    label: "Reach",
    heading: "How should we reach you?",
    note: "A work address and a mobile. Nothing else, and no list.",
  },
] as const;

/** Regional indicator pair, so the flag needs no image. */
function flag(code: string) {
  return String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

const REGIONS = typeof Intl !== "undefined" && "DisplayNames" in Intl
  ? new Intl.DisplayNames(["en"], { type: "region" })
  : null;

const COUNTRIES = getCountries()
  .map((code) => ({
    code,
    dial: getCountryCallingCode(code),
    name: REGIONS?.of(code) ?? code,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

function localeCountry(): CountryCode {
  try {
    const region = new Intl.Locale(navigator.language).region;
    if (region && isSupportedCountry(region)) return region as CountryCode;
  } catch {
    /* older browsers, fall through */
  }
  return "US";
}

/** A journey someone abandoned mid way is worth picking back up. */
function readDraft(): { values: Values; country: CountryCode; hadCountry: boolean } {
  try {
    const saved = sessionStorage.getItem(DRAFT_KEY);
    if (saved) {
      const { country, ...fields } = JSON.parse(saved) as Partial<Values> & { country?: string };
      const known = typeof country === "string" && isSupportedCountry(country);
      return {
        values: { ...EMPTY, ...fields },
        country: known ? (country as CountryCode) : localeCountry(),
        hadCountry: known,
      };
    }
  } catch {
    /* private mode, or a draft we cannot read */
  }
  return { values: EMPTY, country: localeCountry(), hadCountry: false };
}

export default function LeadModal({ onClose }: { onClose: () => void }) {
  const [boot] = useState(readDraft);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(boot.values);
  const [country, setCountry] = useState<CountryCode>(boot.country);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "failed">("idle");

  const panel = useRef<HTMLDivElement>(null);
  const openedAt = useRef(0);
  const countryTouched = useRef(boot.hadCountry);
  const honeypot = useRef<HTMLInputElement>(null);

  /* ── the dial code that matches where they are ───────────────────────── */
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch("https://get.geojs.io/v1/ip/country.json", { signal: ac.signal });
        const code = String(((await res.json()) as { country?: string }).country ?? "").toUpperCase();
        if (!countryTouched.current && isSupportedCountry(code)) setCountry(code as CountryCode);
      } catch {
        /* blocked or offline: the locale guess stands */
      }
    })();
    return () => ac.abort();
  }, []);

  /* ── modal plumbing: scroll lock, escape, focus ──────────────────────── */
  useEffect(() => {
    openedAt.current = Date.now();
    const opener = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  useEffect(() => {
    const first = panel.current?.querySelector<HTMLElement>("input:not([type=hidden]), select");
    first?.focus();
  }, [step, status]);

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key !== "Tab" || !panel.current) return;
    const focusable = panel.current.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled]), input:not([type=hidden]), select, textarea"
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const set = useCallback((key: keyof Values, value: string) => {
    setValues((v) => {
      const next = { ...v, [key]: value };
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        /* nothing to do */
      }
      return next;
    });
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }, []);

  const validateStep = useCallback(
    (index: number) => {
      const found: Partial<Record<keyof Values, string>> = {};
      if (index === 0) {
        const a = checkName(values.firstName, "First name");
        const b = checkName(values.lastName, "Last name");
        if (a) found.firstName = a;
        if (b) found.lastName = b;
      }
      if (index === 1) {
        const a = checkText(values.organization, "Organisation");
        const b = checkText(values.title, "Job title");
        if (a) found.organization = a;
        if (b) found.title = b;
      }
      if (index === 2) {
        const a = checkBusinessEmail(values.email);
        const p = checkPhone(values.phone, country);
        if (a) found.email = a;
        if (p.error) found.phone = p.error;
      }
      setErrors(found);
      return Object.keys(found).length === 0;
    },
    [values, country]
  );

  const send = useCallback(async () => {
    // bots fill every field they find, including the one nobody can see. The
    // floor is deliberately low: six fields in under a second and a half is a
    // script, not a person in a hurry.
    if (honeypot.current?.value || Date.now() - openedAt.current < 1500) {
      setStatus("done");
      return;
    }
    setStatus("sending");
    const phone = checkPhone(values.phone, country);
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: phone.e164 ?? values.phone.trim(),
      phoneCountry: country,
      organization: values.organization.trim(),
      title: values.title.trim(),
      page: window.location.href,
      referrer: document.referrer,
      submittedAt: new Date().toISOString(),
    };

    if (!ENDPOINT) {
      console.error(
        "Lead capture has no endpoint. Set NEXT_PUBLIC_LEAD_ENDPOINT to the Apps Script URL (see docs/lead-capture-setup.md)."
      );
      setStatus("failed");
      return;
    }

    try {
      // text/plain keeps this a simple request, so Apps Script answers without
      // a preflight it cannot reply to
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`endpoint replied ${res.status}`);
      sessionStorage.removeItem(DRAFT_KEY);
      setStatus("done");
    } catch {
      // some setups refuse to expose the response; the row still lands
      try {
        await fetch(ENDPOINT, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
        sessionStorage.removeItem(DRAFT_KEY);
        setStatus("done");
      } catch {
        setStatus("failed");
      }
    }
  }, [values, country]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    void send();
  };

  const dial = useMemo(() => getCountryCallingCode(country), [country]);
  const current = STEPS[step];
  const sending = status === "sending";

  return (
    <div className="lead-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="lead-panel"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-heading"
        onKeyDown={onKeyDown}
      >
        <button className="lead-close" type="button" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        {status === "done" ? (
          <div className="lead-done">
            <span className="lead-eyebrow">That is us connected</span>
            <h2 id="lead-heading">Thanks, {values.firstName.trim() || "and welcome"}.</h2>
            <p className="lead-lede">
              Your details are with us. Here is exactly what happens now, so nothing sits in the dark.
            </p>
            <ol className="lead-next">
              <li>
                <span>01</span>
                <div>
                  <h3>We read it properly</h3>
                  <p>A person looks at your site, your market and where your spend is going today.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>We come back within one working day</h3>
                  <p>By email first, with a time that suits you for a call.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3>Thirty minutes, no pitch</h3>
                  <p>We walk you through what we would fix first and what it would take.</p>
                </div>
              </li>
            </ol>
            <button className="btn btn-primary lead-submit" type="button" onClick={onClose}>
              Back to the site
            </button>
          </div>
        ) : (
          <>
            <div className="lead-head">
              <span className="lead-eyebrow">Start a conversation</span>
              <h2 id="lead-heading">{current.heading}</h2>
              <p className="lead-lede">{current.note}</p>
            </div>

            <ol className="lead-rail" aria-label="Progress">
              {STEPS.map((s, i) => (
                <li key={s.id} className={i === step ? "on" : i < step ? "done" : ""}>
                  <span className="lead-rail-n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="lead-rail-l">{s.label}</span>
                </li>
              ))}
            </ol>

            <form className="lead-form" onSubmit={onSubmit} noValidate>
              <input
                ref={honeypot}
                className="lead-trap"
                type="text"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {step === 0 && (
                <div className="lead-row">
                  <Field
                    id="lead-first"
                    label="First name"
                    value={values.firstName}
                    error={errors.firstName}
                    autoComplete="given-name"
                    onChange={(v) => set("firstName", v)}
                  />
                  <Field
                    id="lead-last"
                    label="Last name"
                    value={values.lastName}
                    error={errors.lastName}
                    autoComplete="family-name"
                    onChange={(v) => set("lastName", v)}
                  />
                </div>
              )}

              {step === 1 && (
                <div className="lead-row">
                  <Field
                    id="lead-org"
                    label="Organisation"
                    value={values.organization}
                    error={errors.organization}
                    autoComplete="organization"
                    onChange={(v) => set("organization", v)}
                  />
                  <Field
                    id="lead-title"
                    label="Job title"
                    value={values.title}
                    error={errors.title}
                    autoComplete="organization-title"
                    onChange={(v) => set("title", v)}
                  />
                </div>
              )}

              {step === 2 && (
                <>
                  <Field
                    id="lead-email"
                    label="Business email"
                    type="email"
                    value={values.email}
                    error={errors.email}
                    autoComplete="email"
                    hint="Work addresses only, so the reply reaches your team."
                    onChange={(v) => set("email", v)}
                  />
                  <div className={`lead-field${errors.phone ? " bad" : ""}`}>
                    <label htmlFor="lead-phone">Mobile number</label>
                    <div className="lead-phone">
                      <div className="lead-dial">
                        <span aria-hidden="true">
                          {flag(country)} +{dial}
                        </span>
                        <select
                          aria-label="Country calling code"
                          value={country}
                          onChange={(e) => {
                            countryTouched.current = true;
                            setCountry(e.target.value as CountryCode);
                            setErrors((x) => ({ ...x, phone: undefined }));
                          }}
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {flag(c.code)} {c.name} +{c.dial}
                            </option>
                          ))}
                        </select>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <input
                        id="lead-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        value={values.phone}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "lead-phone-err" : undefined}
                        onChange={(e) => set("phone", e.target.value)}
                      />
                    </div>
                    {errors.phone && (
                      <p className="lead-err" id="lead-phone-err">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </>
              )}

              {status === "failed" && (
                <p className="lead-err lead-err-send" role="alert">
                  That did not send. Give it another go, and if it keeps failing the form is not
                  connected yet.
                </p>
              )}

              <div className="lead-acts">
                {step > 0 && (
                  <button
                    className="btn btn-line"
                    type="button"
                    onClick={() => setStep(step - 1)}
                    disabled={sending}
                  >
                    Back
                  </button>
                )}
                <button className="btn btn-primary lead-submit" type="submit" disabled={sending}>
                  <span>
                    {sending ? "Sending" : step < STEPS.length - 1 ? "Continue" : "Send it over"}
                  </span>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <p className="lead-foot">
                Step {step + 1} of {STEPS.length}. We use these details to reply to you, nothing else.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  type = "text",
  autoComplete,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <div className={`lead-field${error ? " bad" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? (
        <p className="lead-err" id={`${id}-err`}>
          {error}
        </p>
      ) : hint ? (
        <p className="lead-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
