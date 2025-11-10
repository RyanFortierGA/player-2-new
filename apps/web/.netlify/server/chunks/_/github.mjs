import { GitHub, generateState } from 'arctic';
import { c as createOauthCallbackHandler, a as createOauthRedirectHandler } from './oauth.mjs';

const githubAuth = new GitHub(
  process.env.GITHUB_CLIENT_ID,
  process.env.GITHUB_CLIENT_SECRET,
  null
);
const GITHUB_PROIVDER_ID = "github";
const githubRouteHandler = createOauthRedirectHandler(
  GITHUB_PROIVDER_ID,
  () => {
    const state = generateState();
    const url = githubAuth.createAuthorizationURL(state, ["user:email"]);
    return {
      state,
      url
    };
  }
);
const githubCallbackRouteHandler = createOauthCallbackHandler(
  GITHUB_PROIVDER_ID,
  async (code) => {
    var _a, _b, _c;
    const tokens = await githubAuth.validateAuthorizationCode(code);
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`
      }
    });
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`
      }
    });
    const githubUser = await githubUserResponse.json();
    const emails = await emailsResponse.json();
    githubUser.email = ((_c = (_b = githubUser.email) != null ? _b : (_a = emails.find((email) => email.primary)) == null ? void 0 : _a.email) != null ? _c : "").toLowerCase();
    return {
      id: String(githubUser.id),
      email: githubUser.email,
      name: githubUser.name,
      avatar: githubUser.avatar_url
    };
  }
);

export { githubRouteHandler as a, githubCallbackRouteHandler as g };
//# sourceMappingURL=github.mjs.map
