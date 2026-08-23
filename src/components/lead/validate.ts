import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/min";
import { CONSUMER_DOMAINS, DISPOSABLE_DOMAINS } from "./emailDomains";

/** Letters from any script, plus the punctuation real names carry. */
const NAME_SHAPE = /^[\p{L}][\p{L}\p{M}'’\-. ]{0,48}$/u;
const EMAIL_SHAPE = /^[^\s@,;:<>()[\]\\]+@[^\s@,;:<>()[\]\\]+\.[A-Za-z]{2,24}$/;

export function checkName(value: string, label: string): string | null {
  const v = value.trim();
  if (!v) return `${label} is required.`;
  if (v.length < 2) return `That looks a little short for a ${label.toLowerCase()}.`;
  if (!NAME_SHAPE.test(v)) return `${label} can only contain letters, spaces, hyphens and apostrophes.`;
  return null;
}

export function checkText(value: string, label: string, min = 2): string | null {
  const v = value.trim();
  if (!v) return `${label} is required.`;
  if (v.length < min) return `That looks a little short for a ${label.toLowerCase()}.`;
  return null;
}

/**
 * The registrable part of a host, near enough for our purposes: the last two
 * labels, or three when the second to last is a public suffix stub such as
 * co.uk or com.au.
 */
function registrable(host: string): string {
  const parts = host.split(".");
  if (parts.length <= 2) return host;
  const stubs = new Set(["co", "com", "net", "org", "gov", "edu", "ac", "or", "ne"]);
  const last3 = parts.slice(-3);
  return stubs.has(last3[1]) && last3[2].length === 2 ? last3.join(".") : parts.slice(-2).join(".");
}

export function checkBusinessEmail(value: string): string | null {
  const v = value.trim().toLowerCase();
  if (!v) return "A business email is required.";
  if (!EMAIL_SHAPE.test(v)) return "That does not look like a complete email address.";

  const host = v.slice(v.lastIndexOf("@") + 1);
  const root = registrable(host);
  if (CONSUMER_DOMAINS.has(host) || CONSUMER_DOMAINS.has(root)) {
    return "Please use your work email. Personal mailboxes are not accepted.";
  }
  if (DISPOSABLE_DOMAINS.has(host) || DISPOSABLE_DOMAINS.has(root)) {
    return "That is a temporary mailbox. Please use your work email.";
  }
  return null;
}

export type PhoneCheck = { error: string | null; e164?: string; national?: string };

export function checkPhone(input: string, country: CountryCode): PhoneCheck {
  const raw = input.trim();
  if (!raw) return { error: "A mobile number is required." };
  if (!/\d/.test(raw)) return { error: "Please enter your number in digits." };

  // The country picker supplies the calling code, so read anything the person
  // typed as national unless they pasted a full international number.
  const parsed = raw.startsWith("+")
    ? parsePhoneNumberFromString(raw)
    : parsePhoneNumberFromString(raw, country);

  if (!parsed) return { error: "That number could not be read. Check the digits." };
  if (!parsed.isValid()) return { error: "That is not a valid number for the country selected." };

  return { error: null, e164: parsed.number, national: parsed.formatNational() };
}
