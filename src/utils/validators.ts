// Form validation helpers.
// Centralize validation rules so forms across the app behave consistently.

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

export type ValidationError = string | null;

export const required = (value: unknown): ValidationError =>
  value == null || String(value).trim() === "" ? "This field is required." : null;

export const email = (value: unknown): ValidationError => {
  if (!value) return null;
  if (!EMAIL_REGEX.test(String(value).trim())) return "Enter a valid email address.";
  return null;
};

export const phone = (value: unknown): ValidationError => {
  if (!value) return null;
  if (!PHONE_REGEX.test(String(value).trim())) return "Enter a valid phone number.";
  return null;
};

export const minLength = (min: number) => (value: unknown): ValidationError => {
  if (!value) return null;
  if (String(value).length < min) return `Must be at least ${min} characters.`;
  return null;
};

export const confirmPassword = (password: string, confirmPassword: string): ValidationError => {
  if (!confirmPassword) return "Please confirm your password.";
  if (confirmPassword !== password) return "Passwords do not match.";
  return null;
};

export interface RegistrationForm {
  fullName?: string;
  studentId?: string;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export interface RegistrationErrors {
  fullName?: string;
  studentId?: string;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export const validateRegistrationForm = (form: RegistrationForm): RegistrationErrors => {
  const errors: RegistrationErrors = {};
  if (!form.fullName?.trim()) errors.fullName = "Full name is required.";
  if (!form.studentId?.trim()) errors.studentId = "Student ID is required.";
  if (!form.registrationNumber?.trim()) errors.registrationNumber = "Registration number is required.";
  if (!form.email?.trim()) errors.email = "Email is required.";
  else if (!EMAIL_REGEX.test(form.email)) errors.email = "Enter a valid email address.";
  if (!form.phone?.trim()) errors.phone = "Phone number is required.";
  else if (!PHONE_REGEX.test(form.phone)) errors.phone = "Enter a valid phone number.";
  if (!form.password) errors.password = "Password is required.";
  else if (form.password.length < 6) errors.password = "Password must be at least 6 characters.";
  if (!form.confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords do not match.";
  return errors;
};

export const isValidUrl = (url: string | undefined | null): boolean => {
  if (!url) return true;
  return url.startsWith("/") || /^https?:\/\//i.test(url);
};

export default {
  required,
  email,
  phone,
  minLength,
  confirmPassword,
  validateRegistrationForm,
  isValidUrl,
  EMAIL_REGEX,
  PHONE_REGEX,
};
