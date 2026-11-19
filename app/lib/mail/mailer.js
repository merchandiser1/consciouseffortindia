import nodemailer from "nodemailer";

// Only SMTP_USER + SMTP_PASS needed (Gmail + App Password).
const transporter =
  globalThis.__ceMailer ||
  (globalThis.__ceMailer = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  }));

// Same font as the logo everywhere
const FONT = `'Playfair Display','Didot','Bodoni MT',Georgia,'Times New Roman',serif`;

function otpTemplate(otp) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#161616;font-family:${FONT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#161616;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#202020;border:1px solid #2e2e2e;border-radius:20px;padding:36px;font-family:${FONT};color:#e5e5e5;">

        <!-- Logo: #ConsciousEffortIndia -->
        <tr><td align="center" style="font-family:${FONT};font-size:30px;line-height:1.1;color:#b5b5b5;padding-bottom:28px;">
          <span style="font-weight:400;font-style:italic;color:#6b6b6b;">#</span>ConsciousEffortIndia
        </td></tr>

        <tr><td style="font-family:${FONT};font-size:22px;font-weight:500;color:#f5f5f5;padding-bottom:8px;">Verify your email</td></tr>
        <tr><td style="font-family:${FONT};font-size:15px;color:#9a9a9a;line-height:1.6;padding-bottom:22px;">Use the code below to reset your Conscious Effort India password.</td></tr>

        <tr><td align="center" style="padding-bottom:22px;">
          <div style="display:inline-block;background:#2a2a2a;border:1px solid #3a3a3a;color:#ffffff;font-family:${FONT};font-size:34px;font-weight:700;letter-spacing:10px;padding:16px 26px 16px 36px;border-radius:14px;">${otp}</div>
        </td></tr>

        <tr><td style="font-family:${FONT};font-size:14px;color:#e5e5e5;padding-bottom:10px;">This code expires in <b style="color:#ffffff;">5 minutes</b> and can be used only once.</td></tr>

        <tr><td style="font-family:${FONT};font-size:13px;color:#8a8a8a;line-height:1.6;border-top:1px solid #333333;padding-top:16px;">Never share this code with anyone. Conscious Effort India will never ask for it. If you didn't request a password reset, you can safely ignore this email.</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendOtpEmail(to, otp) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_USER / SMTP_PASS are not set");
  }
  await transporter.sendMail({
    from: `"Conscious Effort India" <${process.env.SMTP_USER}>`,
    to,
    subject: `${otp} is your Conscious Effort India verification code`,
    text: `Your Conscious Effort India verification code is ${otp}. It expires in 5 minutes. Never share this code with anyone.`,
    html: otpTemplate(otp),
  });
}