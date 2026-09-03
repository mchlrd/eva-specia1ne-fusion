// Server-only module: sends contact-form enquiries over SMTP.
// Never import this from client code — it reads mail credentials from the
// environment and must never reach the browser bundle.

export type ContactEnquiry = {
  name: string;
  email: string;
  company?: string;
  message: string;
};

let transporterPromise: Promise<import("nodemailer").Transporter> | undefined;

/**
 * Vite only surfaces VITE_-prefixed vars from .env files, so server-side env
 * (SMTP_*) is not visible in `vite dev`. Load .env.local manually when the
 * credentials aren't already set (e.g. by Vercel). Existing env always wins.
 */
function ensureEnvLoaded(): void {
  if (process.env["SMTP_USER"] && process.env["SMTP_PASS"]) return;
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // No .env.local — credentials come from the hosting platform.
  }
}

function createTransporter() {
  ensureEnvLoaded();
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];
  if (!user || !pass) {
    throw new Error(
      "SMTP credentials are not configured (set SMTP_USER and SMTP_PASS).",
    );
  }
  const host = process.env["SMTP_HOST"] ?? "smtp.office365.com";
  const port = Number(process.env["SMTP_PORT"] ?? 587);
  const secure = (process.env["SMTP_SECURE"] ?? "false") === "true";
  const requireTLS = (process.env["SMTP_REQUIRE_TLS"] ?? "true") === "true";

  return import("nodemailer").then(({ default: nodemailer }) =>
    nodemailer.createTransport({
      host,
      port,
      secure,
      requireTLS,
      auth: { user, pass },
      connectionTimeout: 20_000,
      greetingTimeout: 15_000,
      socketTimeout: 30_000,
    }),
  );
}

function getTransporter() {
  // Reuse the transport across requests (keeps the connection pool warm).
  // Only cache successful creation — a one-off env/bootstrap failure must not
  // poison every later request.
  transporterPromise ??= createTransporter().catch((error) => {
    transporterPromise = undefined;
    throw error;
  });
  return transporterPromise;
}

export async function sendContactEmail(
  enquiry: ContactEnquiry,
): Promise<{ messageId: string }> {
  const transporter = await getTransporter();
  const user = process.env["SMTP_USER"] as string;
  const recipient = process.env["SMTP_TO"] ?? "service@evarotech.ca";

  const text = [
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    enquiry.company ? `Business: ${enquiry.company}` : null,
    "",
    enquiry.message,
    "",
    "---",
    "Sent from the contact form on evarotech.ca.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const info = await transporter.sendMail({
    from: { name: "EvaroTech Website", address: user },
    to: recipient,
    replyTo: enquiry.email,
    subject: `Website enquiry — ${enquiry.name}`,
    text,
  });

  return { messageId: info.messageId };
}