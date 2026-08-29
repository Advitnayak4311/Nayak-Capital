/**
 * Utility functions for masking sensitive identity and financial data
 * in client-facing and operational UI views to comply with privacy best practices.
 */

export function maskAadhaar(aadhaarNumber?: string | null): string {
  if (!aadhaarNumber) return "—";
  const cleaned = aadhaarNumber.replace(/\s+/g, "").replace(/-/g, "");
  if (cleaned.length < 4) return "••••••••••••";
  const lastFour = cleaned.slice(-4);
  return `••••-••••-${lastFour}`;
}

export function maskPAN(pan?: string | null): string {
  if (!pan) return "—";
  const cleaned = pan.trim().toUpperCase();
  if (cleaned.length < 4) return "••••••••••";
  return `${cleaned.slice(0, 2)}•••••${cleaned.slice(-2)}`;
}

export function maskPhone(phone?: string | null): string {
  if (!phone) return "—";
  const cleaned = phone.replace(/\s+/g, "").replace(/-/g, "");
  if (cleaned.length < 4) return "••••••••••";
  return `${cleaned.slice(0, 3)} •••• ${cleaned.slice(-3)}`;
}

export function maskEmail(email?: string | null): string {
  if (!email) return "—";
  const parts = email.split("@");
  if (parts.length !== 2) return "•••••@••••.com";
  const [username, domain] = parts;
  if (username.length <= 2) {
    return `${username[0]}*@${domain}`;
  }
  const maskedUser = `${username[0]}${"*".repeat(Math.min(username.length - 2, 5))}${username[username.length - 1]}`;
  return `${maskedUser}@${domain}`;
}

export function maskBankAccount(accountNumber?: string | null): string {
  if (!accountNumber) return "—";
  const cleaned = accountNumber.trim();
  if (cleaned.length < 4) return "••••••••••••";
  return `••••••••${cleaned.slice(-4)}`;
}

export function maskDocumentNumber(docType: string, docNumber?: string | null): string {
  if (!docNumber) return "—";
  if (docType === "AADHAAR") return maskAadhaar(docNumber);
  if (docType === "PAN_CARD") return maskPAN(docNumber);
  if (docNumber.length > 4) {
    return `••••••••${docNumber.slice(-4)}`;
  }
  return "••••••••";
}
