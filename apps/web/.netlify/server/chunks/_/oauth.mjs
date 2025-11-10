import { OAuth2RequestError } from 'arctic';
import { a as getRequestURL, p as parseCookies, s as setCookie, b as sendRedirect } from '../nitro/nitro.mjs';
import { g as generateSessionToken, c as createSession, a as createSessionCookie } from './sessions.mjs';
import { p as prisma } from './client.mjs';

function createOauthRedirectHandler(providerId, createAuthorizationTokens) {
  return async function(event) {
    const { url, state, codeVerifier } = createAuthorizationTokens();
    setCookie(event, `${providerId}_oauth_state`, state, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 60 * 60,
      sameSite: "lax"
    });
    if (codeVerifier) {
      setCookie(event, "code_verifier", codeVerifier, {
        secure: true,
        // set to false in localhost
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10
        // 10 min
      });
    }
    await sendRedirect(event, url.toString());
  };
}
function createOauthCallbackHandler(providerId, validateAuthorizationCode) {
  return async function(event) {
    var _a, _b;
    const url = getRequestURL(event);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const cookies = parseCookies(event);
    const storedState = (_a = cookies[`${providerId}_oauth_state`]) != null ? _a : null;
    const storedCodeVerifier = (_b = cookies.code_verifier) != null ? _b : null;
    if (!code || !state || !storedState || state !== storedState) {
      return new Response(null, {
        status: 400
      });
    }
    try {
      const oauthUser = await validateAuthorizationCode(
        code,
        storedCodeVerifier != null ? storedCodeVerifier : void 0
      );
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            {
              oauthAccounts: {
                some: {
                  providerId,
                  providerUserId: oauthUser.id
                }
              }
            },
            {
              email: oauthUser.email.toLowerCase()
            }
          ]
        },
        select: {
          id: true,
          oauthAccounts: {
            select: {
              providerId: true
            }
          }
        }
      });
      if (existingUser) {
        if (!existingUser.oauthAccounts.some(
          (account) => account.providerId === providerId
        )) {
          await prisma.userOauthAccount.create({
            data: {
              providerId,
              providerUserId: oauthUser.id,
              userId: existingUser.id
            }
          });
        }
        const sessionToken2 = generateSessionToken();
        await createSession(sessionToken2, existingUser.id);
        const sessionCookie2 = createSessionCookie(sessionToken2);
        setCookie(
          event,
          sessionCookie2.name,
          sessionCookie2.value,
          sessionCookie2.attributes
        );
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/app"
          }
        });
      }
      const newUser = await prisma.user.create({
        data: {
          email: oauthUser.email.toLowerCase(),
          emailVerified: true,
          name: oauthUser.name,
          avatarUrl: oauthUser.avatar
        }
      });
      await prisma.userOauthAccount.create({
        data: {
          providerId,
          providerUserId: oauthUser.id,
          userId: newUser.id
        }
      });
      const sessionToken = generateSessionToken();
      await createSession(sessionToken, newUser.id);
      const sessionCookie = createSessionCookie(sessionToken);
      setCookie(
        event,
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/app"
        }
      });
    } catch (e) {
      console.error(e);
      if (e instanceof OAuth2RequestError) {
        return new Response(null, {
          status: 400
        });
      }
      return new Response(null, {
        status: 500
      });
    }
  };
}

export { createOauthRedirectHandler as a, createOauthCallbackHandler as c };
//# sourceMappingURL=oauth.mjs.map
