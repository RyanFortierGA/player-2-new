import { T as config } from '../nitro/nitro.mjs';
import { serialize } from 'cookie';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { p as prisma } from './client.mjs';

function createSessionCookie(sessionToken, options) {
  const name = config.auth.sessionCookieName;
  const value = sessionToken != null ? sessionToken : "";
  const cookieOptions = {
    secure: true,
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    maxAge: sessionToken ? config.auth.sessionCookieMaxAge : 0,
    ...options
  };
  return {
    name,
    value,
    attributes: cookieOptions,
    serialize: () => serialize(name, value, cookieOptions)
  };
}

function generateSessionToken() {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}
async function createSession(token, userId, options) {
  var _a, _b;
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const maxAge = (_a = options == null ? void 0 : options.maxAge) != null ? _a : config.auth.sessionCookieMaxAge;
  const impersonatorId = (_b = options == null ? void 0 : options.impersonatorId) != null ? _b : null;
  const session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + maxAge * 1e3),
    impersonatorId
  };
  await prisma.userSession.create({
    data: session
  });
  return session;
}
async function validateSessionToken(token) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await prisma.userSession.findUnique({
    where: {
      id: sessionId
    },
    include: {
      user: {
        select: {
          id: true,
          avatarUrl: true,
          email: true,
          emailVerified: true,
          name: true,
          onboardingComplete: true,
          role: true
        }
      }
    }
  });
  if (result === null) {
    return { session: null, user: null };
  }
  const { user, ...session } = result;
  if (Date.now() >= session.expiresAt.getTime()) {
    await prisma.userSession.delete({ where: { id: sessionId } });
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1e3 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1e3 * 60 * 60 * 24 * 30);
    await prisma.userSession.update({
      where: {
        id: session.id
      },
      data: {
        expiresAt: session.expiresAt
      }
    });
  }
  return { session, user };
}
async function invalidateSession(sessionId) {
  await prisma.userSession.delete({ where: { id: sessionId } });
}
async function invalidateUserSessions(userId) {
  await prisma.userSession.deleteMany({ where: { userId } });
}

export { createSessionCookie as a, invalidateUserSessions as b, createSession as c, generateSessionToken as g, invalidateSession as i, validateSessionToken as v };
//# sourceMappingURL=sessions.mjs.map
