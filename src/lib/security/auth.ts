import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const ADMIN_SECRET =
  process.env.ADMIN_JWT_SECRET || "nayak_capital_admin_super_secret_jwt_key_2026";
const CUSTOMER_SECRET =
  process.env.CUSTOMER_SESSION_SECRET || "nayak_capital_customer_auth_token_key_2026";

export interface AdminTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "LOAN_OFFICER" | "AUDITOR";
}

export interface CustomerTokenPayload {
  applicationId: string;
  mobile: string;
  email: string;
}

/**
 * Hash plain password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password with stored hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign JWT for Admin
 */
export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, ADMIN_SECRET, { expiresIn: "12h" });
}

/**
 * Verify JWT for Admin
 */
export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, ADMIN_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Sign JWT for Customer
 */
export function signCustomerToken(payload: CustomerTokenPayload): string {
  return jwt.sign(payload, CUSTOMER_SECRET, { expiresIn: "7d" });
}

/**
 * Verify JWT for Customer
 */
export function verifyCustomerToken(token: string): CustomerTokenPayload | null {
  try {
    return jwt.verify(token, CUSTOMER_SECRET) as CustomerTokenPayload;
  } catch {
    return null;
  }
}
