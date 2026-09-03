import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const enquirySchema = z.object({
  name: z.string().trim().min(1, "Please add your name").max(100, "Name is too long"),
  email: z.string().trim().email("Enter a valid email").max(255, "Email is too long"),
  company: z.string().trim().max(120, "Company is too long").optional(),
  message: z.string().trim().min(1, "Tell us what you need").max(1000, "Please keep it under 1000 characters"),
  // Honeypot — real visitors never fill this; bots do, and get rejected.
  website: z.string().max(0).optional(),
});

// Lightweight per-IP throttle so the mailbox can't be used as a spam relay.
const RATE_WINDOW_MS = 15 * 60_000;
const RATE_MAX_PER_WINDOW = 6;
const hits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  entry.count += 1;
  if (hits.size > 5_000) {
    for (const [key, value] of hits) {
      if (value.resetAt < now) hits.delete(key);
    }
  }
  return entry.count <= RATE_MAX_PER_WINDOW;
}

function clientIp(): string {
  try {
    const headers = getRequest()?.headers;
    return (
      headers
        ?.get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim() ||
      headers?.get("x-real-ip") ||
      "unknown"
    );
  } catch {
    return "unknown";
  }
}

export const sendEnquiry = createServerFn({ method: "POST" })
  .validator(enquirySchema)
  .handler(async ({ data }) => {
    if (!checkRateLimit(clientIp())) {
      throw new Error("Too many enquiries — please try again in a few minutes.");
    }

    const { sendContactEmail } = await import("@/lib/smtp");
    try {
      const { messageId } = await sendContactEmail({
        name: data.name,
        email: data.email,
        message: data.message,
        ...(data.company ? { company: data.company } : {}),
      });
      console.log(
        `[contact-form] enquiry sent from ${data.name} <${data.email}> (${messageId})`,
      );
    } catch (error) {
      console.error("[contact-form] failed to send enquiry:", error);
      throw new Error(
        "We couldn't send your message right now — please try again, or email service@evarotech.ca directly.",
      );
    }

    return { ok: true as const };
  });