import nodemailer from "nodemailer";

// Only SMTP_USER + SMTP_PASS needed (Gmail + App Password).
const transporter =
  globalThis.__ceMailer ||
  (globalThis.__ceMailer = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  }));

function otpTemplate(otp) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:20px;padding:36px;font-family:'Gill Sans','Gill Sans MT',Calibri,Arial,sans-serif;color:#0a0a0a;">
        <tr><td align="center" style="font-family:'Playfair Display',Georgia,serif;font-size:22px;letter-spacing:2px;padding-bottom:24px;">#CONSCIOUSEFFORT</td></tr>
        <tr><td style="font-size:20px;font-weight:600;padding-bottom:8px;">Verify your email</td></tr>
        <tr><td style="font-size:15px;color:#6b7280;line-height:1.5;padding-bottom:22px;">Use the code below to reset your Conscious Effort password.</td></tr>
        <tr><td align="center" style="padding-bottom:22px;">
          <div style="display:inline-block;background:#0a0a0a;color:#ffffff;font-size:34px;font-weight:700;letter-spacing:10px;padding:16px 26px 16px 36px;border-radius:14px;">${otp}</div>
        </td></tr>
        <tr><td style="font-size:14px;color:#0a0a0a;padding-bottom:10px;">This code expires in <b>5 minutes</b> and can be used only once.</td></tr>
        <tr><td style="font-size:13px;color:#6b7280;line-height:1.5;border-top:1px solid #e5e7eb;padding-top:16px;">Never share this code with anyone. Conscious Effort will never ask for it. If you didn't request a password reset, you can safely ignore this email.</td></tr>
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
    from: `"Conscious Effort" <${process.env.SMTP_USER}>`,
    to,
    subject: `${otp} is your Conscious Effort verification code`,
    text: `Your Conscious Effort verification code is ${otp}. It expires in 5 minutes. Never share this code with anyone.`,
    html: otpTemplate(otp),
  });
}
