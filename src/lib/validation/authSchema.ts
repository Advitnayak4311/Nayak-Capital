import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid administrative email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const customerLookupSchema = z.object({
  applicationId: z
    .string()
    .min(5, "Please enter your Application Reference (e.g. NC-APP-2026-0081)")
    .trim(),
  mobileOrEmail: z
    .string()
    .min(3, "Please enter your registered mobile number or email address")
    .trim(),
});

export const recordPaymentSchema = z.object({
  amount: z.number().min(1, "Payment amount must be greater than zero"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.enum(["UPI", "BANK_TRANSFER", "CHEQUE", "CASH", "AUTO_DEBIT"]),
  transactionReference: z.string().min(3, "Transaction reference or UTR is required"),
  notes: z.string().optional(),
});
