
import { z } from "zod";

// Auth form (login)
export const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type AuthFormValues = z.infer<typeof authSchema>;

// Sign up form
export const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  jobTitle: z.string().min(1, "Job title is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

// Password reset (request) schema
export const passwordResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type PasswordResetValues = z.infer<typeof passwordResetSchema>;

// Password update schema (after reset)
export const passwordUpdateSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type PasswordUpdateValues = z.infer<typeof passwordUpdateSchema>;
