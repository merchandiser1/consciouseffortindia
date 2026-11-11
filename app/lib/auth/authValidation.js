export const USERNAME_RE = /^[a-zA-Z0-9_.]{3,20}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Only accept real strings (blocks NoSQL-injection objects like {"$ne": ""})
const str = (v) => (typeof v === "string" ? v : "");

export function passwordError(p) {
  if (typeof p !== "string" || !p) return "Enter a password.";
  if (p.length < 8) return "Password must be at least 8 characters.";
  if (p.length > 64) return "Password must be at most 64 characters.";
  if (!/[a-z]/.test(p)) return "Add at least one lowercase letter.";
  if (!/[A-Z]/.test(p)) return "Add at least one uppercase letter.";
  if (!/[0-9]/.test(p)) return "Add at least one number.";
  if (!/[^A-Za-z0-9]/.test(p)) return "Add at least one special character.";
  if (/\s/.test(p)) return "Password must not contain spaces.";
  return "";
}

export function validateEmail(raw) {
  const email = str(raw).trim().toLowerCase();
  if (!email) return { error: "Enter your email address.", value: "" };
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address, for example name@example.com.", value: "" };
  }
  return { error: "", value: email };
}

export function validateSignup(body) {
  const b = body || {};
  const errors = {};
  const username = str(b.username).trim();
  const email = validateEmail(b.email);
  const password = str(b.password);

  if (!username) errors.username = "Enter a username.";
  else if (username.length < 3) errors.username = "Username must be at least 3 characters.";
  else if (username.length > 20) errors.username = "Username must be 20 characters or fewer.";
  else if (!USERNAME_RE.test(username))
    errors.username = "Username can only contain letters, numbers, underscores (_) and dots (.).";

  if (email.error) errors.email = email.error;

  const pe = passwordError(password);
  if (pe) errors.password = pe;

  if (!b.confirm) errors.confirm = "Please confirm your password.";
  else if (b.confirm !== password) errors.confirm = "Passwords do not match. Please re-enter them.";

  return {
    errors,
    values: { username, usernameLower: username.toLowerCase(), email: email.value, password },
  };
}

export function validateLogin(body) {
  const b = body || {};
  const identifier = str(b.identifier).trim().toLowerCase();
  const password = str(b.password);
  const ok = identifier && identifier.length <= 254 && password && password.length <= 64;
  return { ok: Boolean(ok), identifier, isEmail: identifier.includes("@"), password };
}

export function validateOtp(raw) {
  const otp = str(raw).trim();
  if (!otp) return { error: "Enter the 6-digit code we emailed you.", value: "" };
  if (!/^\d{6}$/.test(otp)) return { error: "The code must be exactly 6 digits.", value: "" };
  return { error: "", value: otp };
}

export function validateReset(body) {
  const b = body || {};
  const errors = {};
  const email = validateEmail(b.email);
  const resetToken = str(b.resetToken);
  const password = str(b.password);

  if (email.error) errors.email = email.error;
  if (!/^[a-f0-9]{64}$/.test(resetToken)) errors.resetToken = "Your reset session is invalid. Please start again.";

  const pe = passwordError(password);
  if (pe) errors.password = pe;

  if (!b.confirm) errors.confirm = "Please confirm your password.";
  else if (b.confirm !== password) errors.confirm = "Passwords do not match. Please re-enter them.";

  return { errors, values: { email: email.value, resetToken, password } };
}