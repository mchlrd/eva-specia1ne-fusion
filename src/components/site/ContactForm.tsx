import { useState } from "react";
import { z } from "zod";

import { firstName, tokens } from "./content-store";
import { useContent } from "./content";

const schema = z.object({
  name: z.string().trim().min(1, "Please add your name").max(100, "Name is too long"),
  email: z.string().trim().email("Enter a valid email").max(255, "Email is too long"),
  company: z.string().trim().max(120, "Company is too long").optional(),
  message: z
    .string()
    .trim()
    .min(1, "Tell us what you need")
    .max(1000, "Please keep it under 1000 characters"),
});

type Field = "name" | "email" | "company" | "message";

/**
 * The fields are structure, so they stay here; their labels and placeholders are
 * copy, so they come from the content file.
 */
const fields: { key: Field; type: "input" | "textarea"; optional?: boolean }[] = [
  { key: "name", type: "input" },
  { key: "email", type: "input" },
  { key: "company", type: "input", optional: true },
  { key: "message", type: "textarea" },
];

/**
 * Where the form posts, decided when the site is built.
 *
 * Managed hosting and the Node deploy leave this unset and call the server
 * function below. A static deployment has no server function, so its build sets
 * the value (see vite.static.config.ts) and the form posts to a small same-origin
 * handler instead — the only server-side piece of a static site.
 */
const ENQUIRY_ENDPOINT = (import.meta.env as Record<string, string | undefined>)[
  "VITE_CONTACT_ENDPOINT"
];

type Enquiry = {
  name: string;
  email: string;
  company?: string | undefined;
  message: string;
};

/**
 * Sends the enquiry by whichever route this build was configured for. Posts
 * form-encoded rather than JSON on purpose: it is a "simple" request, so the
 * browser skips the CORS preflight, and the handler needs no JSON parser.
 */
async function deliverEnquiry(payload: Enquiry, honeypot: string): Promise<void> {
  if (!ENQUIRY_ENDPOINT) {
    // Imported lazily so a static build — where this branch is dead code —
    // doesn't ship the server-function plumbing at all.
    const { sendEnquiry } = await import("@/lib/contact-enquiry");
    await sendEnquiry({ data: { ...payload, website: honeypot } });
    return;
  }

  const body = new URLSearchParams({
    name: payload.name,
    email: payload.email,
    message: payload.message,
    website: honeypot,
  });
  if (payload.company) body.set("company", payload.company);

  const response = await fetch(ENQUIRY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body,
  });

  if (response.ok) return;

  const reply = (await response.json().catch(() => null)) as { error?: string } | null;
  throw new Error(
    reply?.error ?? "We couldn't send your message — please try again, or email us directly.",
  );
}

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const { company, contact } = useContent();
  const copy = contact.form;
  const [values, setValues] = useState<Record<Field, string>>({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<Field, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as Field;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setStatus("sending");
    setErrorMessage(null);
    try {
      await deliverEnquiry(parsed.data, honeypot);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error && err.message
          ? err.message
          : "We couldn't send your message — please try again, or email " +
              `${company.email} directly.`,
      );
    }
  };

  if (status === "sent") {
    return (
      <div className="border-t-2 border-signal pt-8">
        <p className="display-md text-signal">{copy.sentHeading}</p>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
          {tokens(copy.sentBody, {
            firstName: values.name ? `, ${firstName(values.name)}` : "",
            phone: company.phone,
          })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate data-no-glow>
      <div className="border-t border-border">
        {fields.map((f) => (
          <label key={f.key} className="block border-b border-border py-5">
            <span className="label-mono flex items-center justify-between gap-4">
              <span>{copy.labels[f.key]}</span>
              {f.optional && <span className="text-ember">{copy.optional}</span>}
            </span>
            {f.type === "textarea" ? (
              <textarea
                value={values[f.key]}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                rows={5}
                maxLength={1000}
                className="mt-3 w-full resize-none bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
                placeholder={copy.placeholders.message}
              />
            ) : (
              <input
                value={values[f.key]}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                type={f.key === "email" ? "email" : "text"}
                maxLength={255}
                className="mt-3 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
                placeholder={f.key === "email" ? copy.placeholders.email : ""}
              />
            )}
            {errors[f.key] && (
              <span className="label-mono mt-2 block text-destructive">{errors[f.key]}</span>
            )}
          </label>
        ))}
      </div>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
      />

      {status === "error" && <p className="label-mono mt-8 text-destructive">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="bracket hover-glow mt-10 font-display text-2xl font-bold tracking-tight disabled:opacity-50 md:text-3xl"
      >
        {status === "sending" ? copy.sending : copy.submit}
      </button>
    </form>
  );
}
