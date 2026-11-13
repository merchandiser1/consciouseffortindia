import nodemailer from "nodemailer";

const transporter =
  globalThis.__ceAdminMailer ||
  (globalThis.__ceAdminMailer = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  }));

function template(otp) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:20px;padding:36px;font-family:Calibri,Arial,sans-serif;color:#0a0a0a;">
        <tr><td align="center" style="font-family:Georgia,serif;font-size:22px;letter-spacing:2px;padding-bottom:24px;">#CONSCIOUSEFFORT</td></tr>
        <tr><td style="font-size:20px;font-weight:600;padding-bottom:8px;">Admin login</td></tr>
        <tr><td style="font-size:15px;color:#6b7280;line-height:1.5;padding-bottom:22px;">Use the code below to sign in to the admin panel.</td></tr>
        <tr><td align="center" style="padding-bottom:22px;">
          <div style="display:inline-block;background:#0a0a0a;color:#ffffff;font-size:34px;font-weight:700;letter-spacing:10px;padding:16px 26px 16px 36px;border-radius:14px;">${otp}</div>
        </td></tr>
        <tr><td style="font-size:14px;padding-bottom:10px;">This code expires in <b>5 minutes</b> and can be used only once.</td></tr>
        <tr><td style="font-size:13px;color:#6b7280;line-height:1.5;border-top:1px solid #e5e7eb;padding-top:16px;">Never share this code. If you did not try to sign in, ignore this email.</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendAdminOtpEmail(to, otp) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_USER / SMTP_PASS are not set");
  }
  await transporter.sendMail({
    from: `"Conscious Effort Admin" <${process.env.SMTP_USER}>`,
    to,
    subject: `${otp} is your admin login code`,
    text: `Your admin login code is ${otp}. It expires in 5 minutes. Never share this code.`,
    html: template(otp),
  });
}