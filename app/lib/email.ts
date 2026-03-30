// ============================================================
// Triangulate — Email Service (Chunk 8.1)
// Pluggable email sender — Resend when configured, console in dev
// ============================================================

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email. Uses Resend API if RESEND_API_KEY is set,
 * otherwise logs to console for development.
 *
 * To enable Resend:
 * 1. npm install resend
 * 2. Set RESEND_API_KEY in .env
 * 3. Update this function to import and use Resend client
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    // Resend API call (when package is installed)
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Triangulate <onboarding@resend.dev>',
          to: [to],
          subject,
          html,
        }),
      });

      if (!res.ok) {
        console.error('[email] Resend API error:', res.status, await res.text());
        return false;
      }

      return true;
    } catch (err) {
      console.error('[email] Failed to send via Resend:', err);
      return false;
    }
  }

  // Dev fallback — log to console
  console.log('\n========================================');
  console.log(`EMAIL TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log('HTML:', html.slice(0, 200) + '...');
  console.log('========================================\n');
  return true;
}

/**
 * Send a magic link email with branded template.
 */
export async function sendMagicLinkEmail(email: string, magicLink: string): Promise<boolean> {
  const html = `
    <div style="font-family: 'DM Sans', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; letter-spacing: 0.08em; color: #1A1A2E; margin: 0;">
          TRIANGULATE
        </h1>
        <p style="font-size: 9px; letter-spacing: 0.05em; color: #7A7A92; margin: 4px 0 0 0;">
          WHERE ENEMIES AGREE
        </p>
      </div>

      <div style="border-top: 2px solid #1A1A2E; border-bottom: 1px solid #e5e5e5; padding: 24px 0; margin-bottom: 24px;">
        <p style="font-size: 14px; color: #3D3D56; line-height: 1.6; margin: 0;">
          Click the button below to sign in to Triangulate. This link expires in 15 minutes.
        </p>
      </div>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${magicLink}" style="display: inline-block; padding: 12px 32px; background-color: #1A1A2E; color: #FAF9F6; font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 2px;">
          Sign In to Triangulate
        </a>
      </div>

      <p style="font-size: 11px; color: #7A7A92; text-align: center; line-height: 1.5;">
        If you didn't request this link, you can safely ignore this email.
        <br />
        This link will expire in 15 minutes.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Sign in to Triangulate',
    html,
  });
}
