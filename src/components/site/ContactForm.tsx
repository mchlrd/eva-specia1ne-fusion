import { useState } from "react";
import { z } from "zod";

import { company } from "./data";
import { sendEnquiry } from "@/lib/contact-enquiry";

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

const fields: { key: Field; label: string; type: "input" | "textarea"; optional?: boolean }[] = [
  { key: "name", label: "Name", type: "input" },
  { key: "email", label: "Email", type: "input" },
  { key: "company", label: "Business", type: "input", optional: true },
  { key: "message", label: "What do you need?", type: "textarea" },
];

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
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
      await sendEnquiry({ data: { ...parsed.data, website: honeypot } });
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
        <p className="display-md text-signal">Message sent.</p>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
          Thanks{values.name ? `, ${values.name.split(" ")[0]}` : ""} — your enquiry is
          on its way to the EvaroTech team. We usually get back to you within one
          business day. For anything urgent, call {company.phone}.
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
              <span>{f.label}</span>
              {f.optional && <span className="text-ember">Optional</span>}
            </span>
            {f.type === "textarea" ? (
              <textarea
                value={values[f.key]}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                rows={5}
                maxLength={1000}
                className="mt-3 w-full resize-none bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
                placeholder="Networks, servers, backups, wireless…"
              />
            ) : (
              <input
                value={values[f.key]}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                type={f.key === "email" ? "email" : "text"}
                maxLength={255}
                className="mt-3 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
                placeholder={f.key === "email" ? "you@business.ca" : ""}
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

      {status === "error" && (
        <p className="label-mono mt-8 text-destructive">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="bracket hover-glow mt-10 font-display text-2xl font-bold tracking-tight disabled:opacity-50 md:text-3xl"
      >
        {status === "sending" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}