import { Google, generateState, generateCodeVerifier } from 'arctic';
import { c as createOauthCallbackHandler, a as createOauthRedirectHandler } from './oauth.mjs';
import { g as getBaseUrl } from './base-url.mjs';

const googleAuth = new Google(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  new URL("/api/oauth/google/callback", getBaseUrl()).toString()
);
const GOOGLE_PROIVDER_ID = "google";
const googleRouteHandler = createOauthRedirectHandler(
  GOOGLE_PROIVDER_ID,
  () => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = googleAuth.createAuthorizationURL(state, codeVerifier, [
      "profile",
      "email"
    ]);
    return {
      state,
      url,
      codeVerifier
    };
  }
);
const googleCallbackRouteHandler = createOauthCallbackHandler(
  GOOGLE_PROIVDER_ID,
  async (code, verifier) => {
    const tokens = await googleAuth.validateAuthorizationCode(
      code,
      verifier
    );
    const googleUserResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`
        }
      }
    );
    const googleUser = await googleUserResponse.json();
    return {
      id: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      avatar: googleUser.picture
    };
  }
);

export { googleRouteHandler as a, googleCallbackRouteHandler as g };
//# sourceMappingURL=google.mjs.map
