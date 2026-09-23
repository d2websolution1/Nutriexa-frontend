import nodemailer from "nodemailer";

const MAIL_SECRET = process.env.MAIL_SECRET || "nutriexa_secret_mail_token_2026";
const EMAIL_USER = process.env.EMAIL_USER || "princerajpit5868@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "nzwjjzycoiweeqxb";

function buildOtpTemplate(otp, name) {
  const recipientName = name && name !== "Signup Verification" ? name : "Valued Customer";
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background: #4CAF37; color: #ffffff; font-weight: 900; font-size: 20px; border-radius: 12px; margin-bottom: 10px;">NX</div>
        <h1 style="color: #1a1a1a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">NUTRIEXA</h1>
        <p style="color: #4CAF37; font-size: 11px; text-transform: uppercase; margin-top: 4px; letter-spacing: 2px; font-weight: 700;">Nutrition For Excellence</p>
      </div>
      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
      <p style="color: #1a1a1a; font-size: 16px; margin: 0 0 12px 0;">Hello <strong>${recipientName}</strong>,</p>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
        Thank you for choosing Nutriexa. Please use the following 6-digit verification code to complete your verification:
      </p>
      <div style="text-align: center; margin: 28px 0; background: #f7fdf7; border: 2px dashed #4CAF37; border-radius: 12px; padding: 20px 10px;">
        <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #15803d; font-family: 'Courier New', Courier, monospace;">${otp}</span>
      </div>
      <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 8px 0;">
        ⏱️ This code will expire in <strong>10 minutes</strong>.
      </p>
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0 0 24px 0;">
        If you did not request this verification code, please disregard this email.
      </p>
      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
      <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 0;">
        &copy; ${new Date().getFullYear()} Nutriexa Nutrition Inc. All rights reserved.
      </p>
    </div>
  `;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-mail-secret, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Only POST is accepted." });
  }

  const providedSecret = req.headers["x-mail-secret"] || req.body?.secret;
  if (providedSecret !== MAIL_SECRET) {
    return res.status(401).json({ error: "Unauthorized mail request." });
  }

  const { to, otp, name, subject, html } = req.body || {};

  if (!to || !to.includes("@")) {
    return res.status(400).json({ error: "Valid recipient email ('to') is required." });
  }

  const emailSubject = subject || (otp ? `${otp} is your Nutriexa verification code` : "Nutriexa Notification");
  const emailHtml = html || (otp ? buildOtpTemplate(otp, name) : `<p>Hello ${name || ""},</p><p>You have a notification from Nutriexa.</p>`);

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const info = await transporter.sendMail({
      from: `"Nutriexa" <${EMAIL_USER}>`,
      to,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log(`[Vercel Serverless] Email delivered to ${to} (ID: ${info.messageId})`);
    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      provider: "gmail-smtp-vercel",
    });
  } catch (err) {
    console.error("[Vercel Serverless] Email delivery failed:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
