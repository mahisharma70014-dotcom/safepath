import { JWTPayload, jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE_NAME = "safepath_session";

export type AppSession = {
  uid: string;
  email: string;
  fullName: string;
  role: "seller" | "admin";
};

type SessionPayload = JWTPayload & AppSession;

const encoder = new TextEncoder();
const sessionSecret = encoder.encode(
  process.env.SESSION_SECRET ?? "dev-session-secret-change-in-production",
);

export const signSession = async (session: AppSession) => {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(sessionSecret);
};

export const verifySession = async (token: string): Promise<AppSession | null> => {
  try {
    const { payload } = await jwtVerify(token, sessionSecret);
    const session = payload as SessionPayload;

    if (!session.uid || !session.email || !session.role || !session.fullName) {
      return null;
    }

    return {
      uid: session.uid,
      email: session.email,
      fullName: session.fullName,
      role: session.role,
    };
  } catch {
    return null;
  }
};
