export type UserRole = "seller" | "admin";

export type StoredUser = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
};

export type SessionUser = {
  email: string;
  fullName: string;
  role: UserRole;
};

const USERS_KEY = "safepath_users";
const SESSION_KEY = "safepath_session";

const defaultUsers: StoredUser[] = [
  {
    fullName: "SafePath Seller",
    email: "seller@company.com",
    phone: "9999999999",
    password: "Seller@123",
    role: "seller",
  },
  {
    fullName: "SafePath Admin",
    email: "admin@company.com",
    phone: "8888888888",
    password: "Admin@123",
    role: "admin",
  },
];

const canUseStorage = () => typeof window !== "undefined";

export const getUsers = (): StoredUser[] => {
  if (!canUseStorage()) return defaultUsers;

  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) return defaultUsers;

  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    return [...defaultUsers, ...parsed.filter((user) => !defaultUsers.some((d) => d.email === user.email))];
  } catch {
    return defaultUsers;
  }
};

export const saveUser = (user: StoredUser): void => {
  if (!canUseStorage()) return;

  const existing = getUsers().filter((item) => !defaultUsers.some((d) => d.email === item.email));
  window.localStorage.setItem(USERS_KEY, JSON.stringify([...existing, user]));
};

export const findUser = (email: string, password: string): StoredUser | undefined => {
  const normalized = email.trim().toLowerCase();
  return getUsers().find(
    (user) => user.email.toLowerCase() === normalized && user.password === password,
  );
};

export const setSession = (session: SessionUser, remember: boolean): void => {
  if (!canUseStorage()) return;

  const value = JSON.stringify(session);
  if (remember) {
    window.localStorage.setItem(SESSION_KEY, value);
    window.sessionStorage.removeItem(SESSION_KEY);
    return;
  }

  window.sessionStorage.setItem(SESSION_KEY, value);
  window.localStorage.removeItem(SESSION_KEY);
};

export const getSession = (): SessionUser | null => {
  if (!canUseStorage()) return null;

  const raw = window.sessionStorage.getItem(SESSION_KEY) ?? window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
};

export const clearSession = (): void => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
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
