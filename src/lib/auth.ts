export type UserRole = "seller" | "admin";

export type SessionUser = {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export const isCompanyEmail = (email: string): boolean => {
  const normalized = email.trim().toLowerCase();
  const blockedDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "aol.com",
    "proton.me",
    "protonmail.com",
  ];

  const [, domain] = normalized.split("@");
  if (!domain) return false;
  return !blockedDomains.includes(domain);
};
