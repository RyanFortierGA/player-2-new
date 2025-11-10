import { c as createContext, a as createCallerFactory, b as apiRouter } from './context.mjs';

const createApiCaller = async (event) => {
  const context = await createContext(event);
  return createCallerFactory(apiRouter)(context);
};
const createAdminApiCaller = async () => {
  const context = await createContext({ isAdmin: true });
  return createCallerFactory(apiRouter)(context);
};

export { createAdminApiCaller as a, createApiCaller as c };
//# sourceMappingURL=caller.mjs.map
