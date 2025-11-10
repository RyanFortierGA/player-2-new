import { initTRPC, TRPCError } from '@trpc/server';
import { z, ZodError } from 'zod';
import superjson from 'superjson';
import { createConsola } from 'consola';
import { p as prisma } from './client.mjs';
import { s as setCookie, az as sendEmail, p as parseCookies, T as config } from '../nitro/nitro.mjs';
import { g as generateSessionToken, c as createSession, i as invalidateSession, a as createSessionCookie, b as invalidateUserSessions, v as validateSessionToken } from './sessions.mjs';
import { generateRandomString } from '@oslojs/crypto/random';
import { g as getBaseUrl } from './base-url.mjs';
import OpenAI from 'openai';
import { hash, verify } from '@node-rs/argon2';
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import { GetObjectCommand, S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getSignedUrl$1 } from '@aws-sdk/s3-request-presigner';

const transformJsonNull = (v) => {
  if (!v || v === "DbNull") return Prisma.DbNull;
  if (v === "JsonNull") return Prisma.JsonNull;
  return v;
};
const JsonValueSchema = z.lazy(
  () => z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema))
  ])
);
z.union([JsonValueSchema, z.literal("DbNull"), z.literal("JsonNull")]).nullable().transform((v) => transformJsonNull(v));
const InputJsonValueSchema = z.lazy(
  () => z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.function(z.tuple([]), z.any()) }),
    z.record(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)])))
  ])
);
z.enum(["ReadUncommitted", "ReadCommitted", "RepeatableRead", "Serializable"]);
z.enum(["id", "email", "emailVerified", "role", "name", "avatarUrl", "createdAt", "hashedPassword", "onboardingComplete"]);
z.enum(["id", "userId", "expiresAt", "impersonatorId"]);
z.enum(["id", "providerId", "providerUserId", "userId"]);
z.enum(["id", "userId", "expires"]);
z.enum(["id", "userId", "code", "type", "identifier", "expires"]);
z.enum(["id", "name", "avatarUrl", "region", "divisionId", "seasonId", "wins", "losses", "ties", "points", "waitlistSpot", "status", "captainUserId", "averagePeakRank"]);
z.enum(["id", "teamId", "userId", "role", "isCreator"]);
z.enum(["id", "teamId", "email", "role", "createdAt", "expiresAt"]);
z.enum(["id", "teamId", "customerId", "status", "planId", "variantId", "nextPaymentDate"]);
z.enum(["id", "name", "startDate", "endDate", "status", "createdAt"]);
z.enum(["id", "level", "region", "capacity", "teamSize", "maxRoster", "seasonId"]);
z.enum(["id", "seasonId", "divisionId", "region", "weekNumber", "scheduledAt", "status", "homeTeamId", "awayTeamId", "homeScore", "awayScore", "notes", "modeSequence", "mapPicks", "forfeitedByTeamId", "createdAt", "updatedAt"]);
z.enum(["id", "teamId", "region", "priority", "createdAt"]);
z.enum(["id", "teamId", "name", "gamerTag", "platform", "role", "isSub", "createdAt"]);
z.enum(["asc", "desc"]);
z.enum(["DbNull", "JsonNull"]).transform((value) => value === "JsonNull" ? Prisma.JsonNull : value === "DbNull" ? Prisma.DbNull : value);
z.enum(["default", "insensitive"]);
z.enum(["first", "last"]);
z.enum(["DbNull", "JsonNull", "AnyNull"]).transform((value) => value === "JsonNull" ? Prisma.JsonNull : value === "DbNull" ? Prisma.JsonNull : value === "AnyNull" ? Prisma.AnyNull : value);
const UserRoleSchema = z.enum(["USER", "ADMIN"]);
const UserOneTimePasswordTypeSchema = z.enum(["SIGNUP", "LOGIN", "PASSWORD_RESET"]);
const TeamMemberRoleSchema = z.enum(["MEMBER", "OWNER"]);
const SubscriptionStatusSchema = z.enum(["TRIALING", "ACTIVE", "PAUSED", "CANCELED", "PAST_DUE", "UNPAID", "INCOMPLETE", "EXPIRED"]);
const RegionSchema = z.enum(["US_EAST", "US_WEST", "EUROPE", "ASIA", "AU_NZ", "SOUTH_AMERICA", "AFRICA"]);
const SeasonStatusSchema = z.enum(["UPCOMING", "ACTIVE", "COMPLETED"]);
const MatchStatusSchema = z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "FORFEIT", "NEEDS_RESOLUTION"]);
const UserSchema = z.object({
  role: UserRoleSchema,
  id: z.string().cuid(),
  email: z.string(),
  emailVerified: z.boolean(),
  name: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
  hashedPassword: z.string().nullable(),
  onboardingComplete: z.boolean()
});
z.object({
  id: z.string(),
  userId: z.string(),
  expiresAt: z.coerce.date(),
  impersonatorId: z.string().nullable()
});
z.object({
  id: z.string().cuid(),
  providerId: z.string(),
  providerUserId: z.string(),
  userId: z.string()
});
z.object({
  id: z.string().cuid(),
  userId: z.string(),
  expires: z.coerce.date()
});
z.object({
  type: UserOneTimePasswordTypeSchema,
  id: z.string().cuid(),
  userId: z.string(),
  code: z.string(),
  identifier: z.string(),
  expires: z.coerce.date()
});
const TeamSchema = z.object({
  region: RegionSchema.nullable(),
  id: z.string().cuid(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  divisionId: z.string().nullable(),
  seasonId: z.string().nullable(),
  wins: z.number().int(),
  losses: z.number().int(),
  ties: z.number().int(),
  points: z.number().int(),
  waitlistSpot: z.number().int().nullable(),
  status: z.string().nullable(),
  captainUserId: z.string().nullable(),
  averagePeakRank: z.string().nullable()
});
const TeamMembershipSchema = z.object({
  role: TeamMemberRoleSchema,
  id: z.string().cuid(),
  teamId: z.string(),
  userId: z.string(),
  isCreator: z.boolean()
});
const TeamInvitationSchema = z.object({
  role: TeamMemberRoleSchema,
  id: z.string().cuid(),
  teamId: z.string(),
  email: z.string(),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date()
});
const SubscriptionSchema = z.object({
  status: SubscriptionStatusSchema,
  id: z.string(),
  teamId: z.string(),
  customerId: z.string(),
  planId: z.string(),
  variantId: z.string(),
  nextPaymentDate: z.coerce.date().nullable()
});
z.object({
  status: SeasonStatusSchema,
  id: z.string().cuid(),
  name: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  createdAt: z.coerce.date()
});
z.object({
  region: RegionSchema,
  id: z.string().cuid(),
  level: z.number().int(),
  capacity: z.number().int(),
  teamSize: z.number().int(),
  maxRoster: z.number().int(),
  seasonId: z.string()
});
z.object({
  region: RegionSchema,
  status: MatchStatusSchema,
  id: z.string().cuid(),
  seasonId: z.string(),
  divisionId: z.string(),
  weekNumber: z.number().int(),
  scheduledAt: z.coerce.date(),
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  homeScore: z.number().int().nullable(),
  awayScore: z.number().int().nullable(),
  notes: z.string().nullable(),
  modeSequence: JsonValueSchema.nullable(),
  mapPicks: JsonValueSchema.nullable(),
  forfeitedByTeamId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});
z.object({
  region: RegionSchema,
  id: z.string().cuid(),
  teamId: z.string(),
  priority: z.number().int(),
  createdAt: z.coerce.date()
});
z.object({
  id: z.string().cuid(),
  teamId: z.string(),
  name: z.string(),
  gamerTag: z.string().nullable(),
  platform: z.string().nullable(),
  role: z.string().nullable(),
  isSub: z.boolean(),
  createdAt: z.coerce.date()
});

const logger = createConsola({
  formatOptions: {
    date: false
  },
  level: 3 
});

const t = initTRPC.context().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten((issue) => {
          return issue;
        }) : null
      }
    };
  }
});
const isAuthenticatedMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      session: ctx.session
    }
  });
});
const isAdminMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.user.role !== UserRoleSchema.Values.ADMIN) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      session: ctx.session
    }
  });
});
const loggerMiddleware = t.middleware(async (opts) => {
  const { type, next, path } = opts;
  const start = Date.now();
  const request = await next(opts);
  const duration = Date.now() - start;
  const logLabel = `${type.toUpperCase()} ${path} in ${duration}ms`;
  request.ok ? logger.info(logLabel) : logger.error(logLabel);
  return request;
});
const { router, createCallerFactory } = t;
const publicProcedure = t.procedure.use(loggerMiddleware);
const protectedProcedure = t.procedure.use(loggerMiddleware).use(isAuthenticatedMiddleware);
const adminProcedure = t.procedure.use(loggerMiddleware).use(isAdminMiddleware);

const deleteUser = adminProcedure.input(
  z.object({
    id: z.string()
  })
).mutation(async ({ input: { id } }) => {
  try {
    await prisma.user.delete({
      where: {
        id
      }
    });
    await prisma.team.deleteMany({
      where: {
        memberships: {
          every: {
            userId: id
          }
        }
      }
    });
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

const random = {
  read(bytes) {
    crypto.getRandomValues(bytes);
  }
};
const numberAlphabet = "0123456789";
const generateVerificationToken = async ({
  userId,
  expireDuration = 1e3 * 60 * 60 * 2
}) => {
  const storedUserTokens = await prisma.userVerificationToken.findMany({
    where: {
      userId
    }
  });
  if (storedUserTokens.length > 0) {
    const reusableStoredToken = storedUserTokens.find((token) => {
      return new Date(Number(token.expires) - expireDuration / 2) >= /* @__PURE__ */ new Date();
    });
    if (reusableStoredToken) {
      return reusableStoredToken.id;
    }
  }
  const { id } = await prisma.userVerificationToken.create({
    data: {
      expires: new Date((/* @__PURE__ */ new Date()).getTime() + expireDuration),
      userId
    }
  });
  return id;
};
const validateVerificationToken = async ({
  token
}) => {
  const storedToken = await prisma.userVerificationToken.findUnique({
    where: {
      id: token
    }
  });
  if (!storedToken) {
    throw new Error("Invalid token");
  }
  await prisma.userVerificationToken.delete({
    where: {
      id: storedToken.id
    }
  });
  if (storedToken.expires < /* @__PURE__ */ new Date()) {
    throw new Error("Expired token");
  }
  return storedToken.userId;
};
const generateOneTimePassword = async ({
  userId,
  type,
  identifier,
  expireDuration = 1e3 * 60 * 60 * 2
}) => {
  const storedUserTokens = await prisma.userOneTimePassword.findMany({
    where: {
      userId
    }
  });
  if (storedUserTokens.length > 0) {
    const reusableStoredToken = storedUserTokens.find((token) => {
      return new Date(Number(token.expires) - expireDuration) >= /* @__PURE__ */ new Date();
    });
    if (reusableStoredToken) {
      return reusableStoredToken.code;
    }
  }
  const otp = generateRandomString(random, numberAlphabet, 6);
  await prisma.userOneTimePassword.create({
    data: {
      code: otp,
      type,
      identifier,
      expires: new Date((/* @__PURE__ */ new Date()).getTime() + expireDuration),
      userId
    }
  });
  return otp;
};
const validateOneTimePassword = async ({
  code,
  type,
  identifier
}) => {
  const storedOtp = await prisma.userOneTimePassword.findFirst({
    where: {
      code,
      type,
      identifier
    }
  });
  if (!storedOtp) {
    throw new Error("Invalid token");
  }
  await prisma.userOneTimePassword.delete({
    where: {
      id: storedOtp.id
    }
  });
  if (storedOtp.expires < /* @__PURE__ */ new Date()) {
    throw new Error("Expired token");
  }
  return storedOtp.userId;
};

const impersonate = adminProcedure.input(
  z.object({
    userId: z.string()
  })
).output(z.void()).mutation(async ({ input: { userId }, ctx: { user, session, event } }) => {
  const userExists = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!userExists) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }
  try {
    const newSessionToken = generateSessionToken();
    await createSession(newSessionToken, userId, {
      impersonatorId: user.id
    });
    await invalidateSession(session.id);
    const sessionCookie = createSessionCookie(newSessionToken);
    if (event) {
      setCookie(
        event,
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

const unimpersonate = protectedProcedure.input(z.void()).output(z.void()).mutation(async ({ ctx: { session, event } }) => {
  try {
    const currentSession = await prisma.userSession.findUnique({
      where: {
        id: session.id
      }
    });
    if (!currentSession || !currentSession.impersonatorId) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    await invalidateSession(session.id);
    const newSessionToken = await generateSessionToken();
    await createSession(newSessionToken, currentSession.impersonatorId);
    const sessionCookie = createSessionCookie(newSessionToken);
    if (event) {
      setCookie(
        event,
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

const users = adminProcedure.input(
  z.object({
    limit: z.number().optional().default(25),
    offset: z.number().optional().default(0),
    searchTerm: z.string().optional()
  })
).output(
  z.object({
    users: z.array(
      UserSchema.pick({
        id: true,
        email: true,
        emailVerified: true,
        role: true,
        avatarUrl: true,
        name: true
      }).extend({
        memberships: z.array(
          TeamMembershipSchema.extend({
            team: TeamSchema
          })
        ).nullable()
      })
    ),
    total: z.number()
  })
).query(async ({ input: { limit, offset, searchTerm } }) => {
  const sanitizedSearchTerm = (searchTerm != null ? searchTerm : "").trim().toLowerCase();
  const where = sanitizedSearchTerm ? {
    OR: [
      {
        name: {
          contains: sanitizedSearchTerm
        }
      },
      {
        email: {
          contains: sanitizedSearchTerm
        }
      }
    ]
  } : {};
  const users2 = await prisma.user.findMany({
    where,
    select: {
      avatarUrl: true,
      email: true,
      emailVerified: true,
      role: true,
      id: true,
      name: true,
      memberships: {
        include: {
          team: true
        }
      }
    },
    take: limit,
    skip: offset
  });
  const total = await prisma.user.count({
    where
  });
  return {
    users: users2,
    total
  };
});

const resendVerificationMail = adminProcedure.input(
  z.object({
    userId: z.string()
  })
).mutation(async ({ input: { userId } }) => {
  var _a;
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found."
    });
  }
  if (user.emailVerified) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "User's email is already verified."
    });
  }
  const token = await generateVerificationToken({
    userId: user.id
  });
  const otp = await generateOneTimePassword({
    userId: user.id,
    type: "SIGNUP",
    identifier: user.email
  });
  const url = new URL(getBaseUrl());
  url.searchParams.set("token", token);
  try {
    await sendEmail({
      templateId: "newUser",
      to: user.email,
      context: {
        url: url.toString(),
        otp,
        name: (_a = user.name) != null ? _a : user.email
      }
    });
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not send email"
    });
  }
});

const adminProcedures = /*#__PURE__*/Object.freeze({
  __proto__: null,
  deleteUser: deleteUser,
  impersonate: impersonate,
  resendVerificationMail: resendVerificationMail,
  unimpersonate: unimpersonate,
  users: users
});

const generateProductNames = protectedProcedure.input(
  z.object({
    topic: z.string()
  })
).output(z.array(z.string())).query(async ({ input: { topic } }) => {
  var _a;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `List me five funny product names that could be used for ${topic}`
      }
    ]
  });
  const ideas = ((_a = response.choices[0].message.content) != null ? _a : "").split("\n").filter((name) => name.length > 0);
  return ideas;
});

const aiProcedures = /*#__PURE__*/Object.freeze({
  __proto__: null,
  generateProductNames: generateProductNames
});

const changeEmail = protectedProcedure.input(
  z.object({
    email: z.string().email().min(1).max(255).transform((v) => v.toLowerCase()),
    callbackUrl: z.string()
  })
).mutation(async ({ ctx: { user, event }, input: { email, callbackUrl } }) => {
  var _a;
  if (!user) {
    return;
  }
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      email,
      emailVerified: false
    }
  });
  await invalidateUserSessions(user.id);
  const sessionCookie = createSessionCookie(null);
  if (event) {
    setCookie(
      event,
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  }
  const token = await generateVerificationToken({
    userId: user.id
  });
  const url = new URL(callbackUrl);
  url.searchParams.set("token", token);
  sendEmail({
    to: email,
    templateId: "emailChange",
    context: {
      name: (_a = updatedUser.name) != null ? _a : updatedUser.email,
      url: url.toString()
    }
  });
});

async function hashPassword(password) {
  return await hash(password, {
    algorithm: 2
  });
}
async function verifyPassword(hashedPassword, password) {
  return verify(hashedPassword, password, {
    algorithm: 2
  });
}

const passwordSchema = z.string().min(8).max(255).refine((password) => /[A-Z]/.test(password), {
  params: {
    i18n: {
      key: "uppercase_character_required",
      values: {
        character: "A-Z"
      }
    }
  }
}).refine((password) => /[a-z]/.test(password), {
  params: {
    i18n: {
      key: "lowercase_character_required",
      values: {
        character: "a-z"
      }
    }
  }
}).refine((password) => /[0-9]/.test(password), {
  params: {
    i18n: {
      key: "number_required",
      values: {
        character: "0-9"
      }
    }
  }
}).refine((password) => /[!@#$%^&*]/.test(password), {
  params: {
    i18n: {
      key: "special_character_required",
      values: {
        character: "!@#$%^&"
      }
    }
  }
});

const changePassword = protectedProcedure.input(
  z.object({
    password: passwordSchema
  })
).mutation(async ({ ctx: { user }, input: { password } }) => {
  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      hashedPassword: await hashPassword(password)
    }
  });
});

const deleteAccount = protectedProcedure.input(z.void()).mutation(async ({ ctx: { event, user } }) => {
  try {
    await prisma.user.delete({
      where: {
        id: user.id
      }
    });
    await prisma.team.deleteMany({
      where: {
        memberships: {
          every: {
            userId: user.id
          }
        }
      }
    });
    const sessionCookie = createSessionCookie(null);
    if (event) {
      setCookie(
        event,
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

const forgotPassword = publicProcedure.input(
  z.object({
    email: z.string().email().min(1).max(255).transform((v) => v.toLowerCase()),
    callbackUrl: z.string()
  })
).mutation(async ({ input: { email, callbackUrl } }) => {
  var _a;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });
    if (!user) {
      throw new Error("User not found");
    }
    const token = await generateVerificationToken({
      userId: user.id
    });
    const otp = await generateOneTimePassword({
      userId: user.id,
      type: "PASSWORD_RESET",
      identifier: email
    });
    const url = new URL(callbackUrl);
    url.searchParams.set("token", token);
    await sendEmail({
      templateId: "forgotPassword",
      to: email,
      context: {
        url: url.toString(),
        name: (_a = user.name) != null ? _a : user.email,
        otp
      }
    });
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

const loginWithEmail = publicProcedure.input(
  z.object({
    email: z.string().email().min(1).max(255).transform((v) => v.trim().toLowerCase()).superRefine(async (email, ctx) => {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (!existingUser) {
        ctx.addIssue({
          code: "custom",
          params: {
            i18n: {
              key: "email_not_found"
            }
          }
        });
      } else if (!existingUser.emailVerified) {
        ctx.addIssue({
          code: "custom",
          params: {
            i18n: {
              key: "email_not_verified"
            }
          }
        });
      }
    }),
    callbackUrl: z.string()
  })
).mutation(async ({ input: { email, callbackUrl } }) => {
  var _a;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });
    if (!user) {
      throw new Error("User not found");
    }
    const token = await generateVerificationToken({
      userId: user.id
    });
    const otp = await generateOneTimePassword({
      userId: user.id,
      type: "LOGIN",
      identifier: email
    });
    const url = new URL(callbackUrl);
    url.searchParams.set("token", token);
    await sendEmail({
      templateId: "magicLink",
      to: email,
      context: {
        url: url.toString(),
        name: (_a = user.name) != null ? _a : user.email,
        otp
      }
    });
  } catch (e) {
    logger.error(e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

const loginWithPassword = publicProcedure.input(
  z.object({
    email: z.string().email().min(1).max(255).transform((v) => v.trim().toLowerCase()).superRefine(async (email, ctx) => {
      const existingUser = await prisma.user.findUnique({
        where: {
          email
        }
      });
      if (!existingUser) {
        ctx.addIssue({
          code: "custom",
          params: {
            i18n: {
              key: "email_not_found"
            }
          }
        });
      } else if (!existingUser.emailVerified) {
        ctx.addIssue({
          code: "custom",
          params: {
            i18n: {
              key: "email_not_verified"
            }
          }
        });
      }
    }),
    password: z.string().min(8).max(255)
  })
).output(
  z.object({
    user: UserSchema.pick({
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true
    })
  })
).mutation(async ({ input: { email, password }, ctx: { event } }) => {
  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!user || !user.hashedPassword)
    throw new TRPCError({
      code: "NOT_FOUND"
    });
  if (!user.emailVerified)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Email not verified"
    });
  const isValidPassword = await verifyPassword(user.hashedPassword, password);
  if (!isValidPassword)
    throw new TRPCError({
      code: "NOT_FOUND"
    });
  const sessionToken = await generateSessionToken();
  await createSession(sessionToken, user.id);
  const sessionCookie = createSessionCookie(sessionToken);
  if (event) {
    setCookie(
      event,
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  }
  return {
    user
  };
});

const logout = protectedProcedure.mutation(
  async ({ ctx: { session, event } }) => {
    try {
      await invalidateSession(session.id);
      const sessionCookie = createSessionCookie(null);
      if (event) {
        setCookie(
          event,
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch (e) {
      console.error(e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR"
      });
    }
  }
);

const signup$1 = publicProcedure.input(
  z.object({
    email: z.string().email().min(1).max(255).transform((v) => v.trim().toLowerCase()).refine(
      async (email) => !await prisma.user.findUnique({
        where: {
          email
        }
      }),
      {
        params: {
          i18n: {
            key: "email_already_exists"
          }
        }
      }
    ),
    password: passwordSchema,
    callbackUrl: z.string()
  })
).mutation(async ({ input: { email, password, callbackUrl } }) => {
  var _a;
  try {
    const hashedPassword = await hashPassword(password);
    const autoVerify = process.env.AUTH_AUTO_VERIFY === "true";
    const user = await prisma.user.create({
      data: {
        email,
        role: UserRoleSchema.Values.USER,
        hashedPassword,
        emailVerified: autoVerify ? true : void 0
      }
    });
    if (!autoVerify) {
      const token = await generateVerificationToken({
        userId: user.id
      });
      const otp = await generateOneTimePassword({
        userId: user.id,
        type: "SIGNUP",
        identifier: email
      });
      const url = new URL(callbackUrl);
      url.searchParams.set("token", token);
      await sendEmail({
        templateId: "newUser",
        to: email,
        context: {
          url: url.toString(),
          otp,
          name: (_a = user.name) != null ? _a : user.email
        }
      });
    }
  } catch (e) {
    logger.error(e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unknown error occurred."
    });
  }
});

let s3Client = null;
const getS3Client = () => {
  if (s3Client) {
    return s3Client;
  }
  const s3Endpoint = process.env.S3_ENDPOINT;
  if (!s3Endpoint) {
    console.error("Missing env variable S3_ENDPOINT");
  }
  const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID;
  if (!s3AccessKeyId) {
    console.error("Missing env variable S3_ACCESS_KEY_ID");
  }
  const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!s3SecretAccessKey) {
    console.error("Missing env variable S3_SECRET_ACCESS_KEY");
  }
  s3Client = new S3Client({
    region: "auto",
    endpoint: s3Endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: s3AccessKeyId,
      secretAccessKey: s3SecretAccessKey
    }
  });
  return s3Client;
};
const getSignedUploadUrl = async (path, { bucket }) => {
  const s3Client2 = getS3Client();
  try {
    return await getSignedUrl$1(
      s3Client2,
      new PutObjectCommand({ Bucket: bucket, Key: path }),
      {
        expiresIn: 60
      }
    );
  } catch (e) {
    console.error(e);
    throw new Error("Could not get signed upload url");
  }
};
const getSignedUrl = async (path, { bucket, expiresIn }) => {
  const s3Client2 = getS3Client();
  try {
    return getSignedUrl$1(
      s3Client2,
      new GetObjectCommand({ Bucket: bucket, Key: path }),
      { expiresIn }
    );
  } catch (e) {
    console.error(e);
    throw new Error("Could not get signed url");
  }
};

async function getUserAvatarUrl(pathOrUrl) {
  let avatarUrl = pathOrUrl != null ? pathOrUrl : null;
  if (avatarUrl && !avatarUrl.startsWith("http")) {
    avatarUrl = await getSignedUrl(avatarUrl, {
      bucket: process.env.NUXT_PUBLIC_S3_AVATARS_BUCKET_NAME,
      expiresIn: 360
    });
  }
  return avatarUrl;
}

const update$1 = protectedProcedure.input(
  z.object({
    name: z.string().min(1).optional(),
    avatarUrl: z.string().min(1).optional(),
    onboardingComplete: z.boolean().optional()
  })
).mutation(async ({ ctx: { user }, input }) => {
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id
    },
    data: input,
    select: {
      id: true,
      email: true,
      role: true,
      avatarUrl: true,
      name: true,
      onboardingComplete: true
    }
  });
  return {
    ...updatedUser,
    avatarUrl: await getUserAvatarUrl(updatedUser.avatarUrl)
  };
});

const user = publicProcedure.output(
  UserSchema.pick({
    id: true,
    email: true,
    role: true,
    avatarUrl: true,
    name: true,
    onboardingComplete: true
  }).extend({
    teamMemberships: z.array(
      TeamMembershipSchema.extend({
        team: TeamSchema
      })
    ).nullable(),
    impersonatedBy: UserSchema.pick({
      id: true,
      name: true
    }).nullish()
  }).nullable()
).query(async ({ ctx: { user: user2, teamMemberships, session } }) => {
  if (!user2 || !session) {
    return null;
  }
  const impersonatedBy = (session == null ? void 0 : session.impersonatorId) ? await prisma.user.findUnique({
    where: {
      id: session.impersonatorId
    },
    select: {
      id: true,
      name: true
    }
  }) : void 0;
  return {
    ...user2,
    avatarUrl: await getUserAvatarUrl(user2.avatarUrl),
    impersonatedBy,
    teamMemberships
  };
});

const verifyOtp = publicProcedure.input(
  z.object({
    type: UserOneTimePasswordTypeSchema,
    identifier: z.string(),
    code: z.string()
  })
).mutation(async ({ input: { type, identifier, code }, ctx: { event } }) => {
  try {
    const userId = await validateOneTimePassword({
      type,
      identifier,
      code
    });
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });
    if (!user)
      throw new TRPCError({
        code: "NOT_FOUND"
      });
    if (!user.emailVerified)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true
        }
      });
    const sessionToken = generateSessionToken();
    await createSession(sessionToken, userId);
    const sessionCookie = createSessionCookie(sessionToken);
    if (event) {
      setCookie(
        event,
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid one-time password"
    });
  }
});

const verifyToken = publicProcedure.input(
  z.object({
    token: z.string()
  })
).mutation(async ({ input: { token }, ctx: { event } }) => {
  try {
    const userId = await validateVerificationToken({
      token
    });
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });
    if (!user)
      throw new TRPCError({
        code: "NOT_FOUND"
      });
    if (!user.emailVerified)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true
        }
      });
    const sessionToken = generateSessionToken();
    await createSession(sessionToken, userId);
    const sessionCookie = createSessionCookie(sessionToken);
    if (event) {
      setCookie(
        event,
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch (e) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid token"
    });
  }
});

const authProcedures = /*#__PURE__*/Object.freeze({
  __proto__: null,
  changeEmail: changeEmail,
  changePassword: changePassword,
  deleteAccount: deleteAccount,
  forgotPassword: forgotPassword,
  loginWithEmail: loginWithEmail,
  loginWithPassword: loginWithPassword,
  logout: logout,
  signup: signup$1,
  update: update$1,
  user: user,
  verifyOtp: verifyOtp,
  verifyToken: verifyToken
});

let stripeClient = null;
function getStripeClient() {
  if (stripeClient) {
    return stripeClient;
  }
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error("Missing env variable STRIPE_SECRET_KEY");
  }
  stripeClient = new Stripe(stripeSecretKey);
  return stripeClient;
}
const getAllPlans = async function() {
  const stripeClient2 = getStripeClient();
  const response = await stripeClient2.prices.list({
    active: true,
    expand: ["data.product"]
  });
  const plans = [];
  response.data.forEach((price) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const product = price.product;
    if (!plans.find((plan2) => plan2.id === product.id)) {
      plans.push({
        id: product.id,
        name: product.name,
        description: product.description,
        storeId: "",
        variants: [
          {
            id: price.id,
            interval: (_b = (_a = price.recurring) == null ? void 0 : _a.interval) != null ? _b : "year",
            interval_count: (_d = (_c = price.recurring) == null ? void 0 : _c.interval_count) != null ? _d : 0,
            price: (_e = price.unit_amount) != null ? _e : 0,
            currency: price.currency
          }
        ]
      });
      return;
    }
    const plan = plans.find((plan2) => plan2.id === product.id);
    plan == null ? void 0 : plan.variants.push({
      id: price.id,
      interval: (_g = (_f = price.recurring) == null ? void 0 : _f.interval) != null ? _g : "year",
      interval_count: (_i = (_h = price.recurring) == null ? void 0 : _h.interval_count) != null ? _i : 0,
      price: (_j = price.unit_amount) != null ? _j : 0,
      currency: price.currency
    });
  });
  return plans.filter((product) => product.variants.length > 0);
};
const createCheckoutLink$1 = async function({
  variantId,
  teamId,
  redirectUrl
}) {
  const stripeClient2 = getStripeClient();
  const response = await stripeClient2.checkout.sessions.create({
    mode: "subscription",
    success_url: redirectUrl != null ? redirectUrl : "",
    line_items: [
      {
        quantity: 1,
        price: variantId
      }
    ],
    subscription_data: {
      metadata: {
        team_id: teamId
      }
    }
  });
  return response.url;
};
const createCustomerPortalLink$1 = async ({
  customerId,
  redirectUrl
}) => {
  const stripeClient2 = getStripeClient();
  const response = await stripeClient2.billingPortal.sessions.create({
    customer: customerId,
    return_url: redirectUrl != null ? redirectUrl : ""
  });
  return response.url;
};
const cancelSubscription$1 = async ({ id }) => {
  const stripeClient2 = getStripeClient();
  await stripeClient2.subscriptions.cancel(id);
};
const resumeSubscription$1 = async ({ id }) => {
  const stripeClient2 = getStripeClient();
  const response = await stripeClient2.subscriptions.resume(id, {
    billing_cycle_anchor: "unchanged"
  });
  return {
    status: response.status
  };
};

const cancelSubscription = protectedProcedure.input(
  z.object({
    id: z.string()
  })
).mutation(async ({ input: { id }, ctx: { abilities } }) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      id
    }
  });
  if (!subscription)
    throw new TRPCError({
      code: "NOT_FOUND"
    });
  if (!abilities.isTeamOwner(subscription.teamId))
    throw new TRPCError({
      code: "FORBIDDEN"
    });
  try {
    await cancelSubscription$1({ id });
    await prisma.subscription.update({
      where: {
        id
      },
      data: {
        status: "CANCELED"
      }
    });
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

const createCheckoutLink = protectedProcedure.input(
  z.object({
    planId: z.string(),
    variantId: z.string(),
    teamId: z.string(),
    redirectUrl: z.string().optional()
  })
).output(z.string()).mutation(
  async ({
    input: { planId, variantId, redirectUrl, teamId },
    ctx: { user }
  }) => {
    var _a;
    try {
      const checkoutLink = await createCheckoutLink$1({
        planId,
        variantId,
        email: user.email,
        name: (_a = user.name) != null ? _a : "",
        teamId,
        redirectUrl
      });
      if (!checkoutLink) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR"
        });
      }
      return checkoutLink;
    } catch (e) {
      console.error(e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR"
      });
    }
  }
);

const createCustomerPortalLink = protectedProcedure.input(
  z.object({
    subscriptionId: z.string(),
    redirectUrl: z.string().optional()
  })
).output(z.string()).mutation(
  async ({ input: { subscriptionId, redirectUrl }, ctx: { abilities } }) => {
    const subscription = await prisma.subscription.findUnique({
      where: {
        id: subscriptionId
      }
    });
    if (!subscription)
      throw new TRPCError({
        code: "BAD_REQUEST"
      });
    if (!abilities.isTeamOwner(subscription.teamId))
      throw new TRPCError({
        code: "FORBIDDEN"
      });
    try {
      const customerPortalLink = await createCustomerPortalLink$1({
        subscriptionId,
        customerId: subscription.customerId,
        redirectUrl
      });
      if (!customerPortalLink) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR"
        });
      }
      return customerPortalLink;
    } catch (e) {
      console.error(e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR"
      });
    }
  }
);

const SubscriptionPlanVariantModel = z.object({
  id: z.string(),
  price: z.number(),
  currency: z.string(),
  interval: z.string(),
  interval_count: z.number()
});
const SubscriptionPlanModel = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  storeId: z.string().nullable().optional(),
  variants: z.array(SubscriptionPlanVariantModel)
});

const plans = publicProcedure.output(z.array(SubscriptionPlanModel)).query(async () => {
  return await getAllPlans();
});

const resumeSubscription = protectedProcedure.input(
  z.object({
    id: z.string()
  })
).mutation(async ({ input: { id }, ctx: { abilities } }) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      id
    }
  });
  if (!subscription)
    throw new TRPCError({
      code: "NOT_FOUND"
    });
  if (!abilities.isTeamOwner(subscription.teamId))
    throw new TRPCError({
      code: "FORBIDDEN"
    });
  try {
    const { status } = await resumeSubscription$1({ id });
    await prisma.subscription.update({
      where: {
        id
      },
      data: {
        status
      }
    });
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

const syncSubscription = publicProcedure.input(SubscriptionSchema).mutation(async ({ input: subscription, ctx: { isAdmin } }) => {
  if (!isAdmin)
    throw new TRPCError({
      code: "FORBIDDEN"
    });
  let existingSubscription = null;
  if (subscription == null ? void 0 : subscription.teamId) {
    existingSubscription = await prisma.subscription.findUnique({
      where: {
        teamId: subscription.teamId
      }
    });
  }
  try {
    if (!existingSubscription)
      await prisma.subscription.create({
        data: subscription
      });
    else
      await prisma.subscription.update({
        where: {
          teamId: existingSubscription.teamId
        },
        data: subscription
      });
    if (subscription.teamId) {
      if (subscription.status === "ACTIVE") {
        await prisma.team.update({ where: { id: subscription.teamId }, data: { status: "ACTIVE" } });
      } else if (["PAUSED", "PAST_DUE", "UNPAID", "CANCELED", "INCOMPLETE", "EXPIRED"].includes(subscription.status)) {
        await prisma.team.update({ where: { id: subscription.teamId }, data: { status: "ASSIGNED" } });
      }
    }
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

const billingProcedures = /*#__PURE__*/Object.freeze({
  __proto__: null,
  cancelSubscription: cancelSubscription,
  createCheckoutLink: createCheckoutLink,
  createCustomerPortalLink: createCustomerPortalLink,
  plans: plans,
  resumeSubscription: resumeSubscription,
  syncSubscription: syncSubscription
});

const signup = publicProcedure.input(
  z.object({
    email: z.string()
  })
).mutation(async ({ input: { email } }) => {
  return await sendEmail({
    to: email,
    templateId: "newsletterSignup",
    context: {}
  });
});

const newsletterProcedures = /*#__PURE__*/Object.freeze({
  __proto__: null,
  signup: signup
});

const acceptInvitation = protectedProcedure.input(
  z.object({
    id: z.string()
  })
).output(TeamSchema.pick({ name: true })).mutation(async ({ input: { id }, ctx: { user } }) => {
  const invitation = await prisma.teamInvitation.findUnique({
    where: {
      id
    }
  });
  if (!invitation)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Invitation not found."
    });
  if (invitation.expiresAt < /* @__PURE__ */ new Date())
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Invitation expired."
    });
  const membershipCount = await prisma.teamMembership.count({ where: { teamId: invitation.teamId } });
  let maxRoster = 6;
  const teamForDivision = await prisma.team.findUnique({ where: { id: invitation.teamId }, select: {
    divisionId: true,
    /* @ts-expect-error */
    preferredTeamSize: true
  } });
  if (teamForDivision == null ? void 0 : teamForDivision.divisionId) {
    const division = await prisma.division.findUnique({ where: { id: teamForDivision.divisionId }, select: { maxRoster: true } });
    if (division == null ? void 0 : division.maxRoster) maxRoster = division.maxRoster;
  } else if ((teamForDivision == null ? void 0 : teamForDivision.preferredTeamSize) === 2) {
    maxRoster = 3;
  }
  if (membershipCount >= maxRoster) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Roster is full" });
  }
  const { team } = await prisma.teamMembership.create({
    data: {
      teamId: invitation.teamId,
      userId: user.id,
      role: invitation.role
    },
    include: {
      team: {
        select: {
          name: true
        }
      }
    }
  });
  await prisma.teamInvitation.delete({
    where: {
      id
    }
  });
  return team;
});

const byId = protectedProcedure.input(
  z.object({
    id: z.string()
  })
).output(TeamSchema).query(async ({ input: { id }, ctx: { abilities } }) => {
  const team = await prisma.team.findUnique({
    where: {
      id
    }
  });
  if (!team) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Team not found."
    });
  }
  if (!abilities.isTeamMember(team.id)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No permission to read this team."
    });
  }
  return team;
});

const create = protectedProcedure.input(
  z.object({
    name: z.string(),
    region: z.enum([
      "US_EAST",
      "US_WEST",
      "EUROPE",
      "ASIA",
      "AU_NZ",
      "SOUTH_AMERICA",
      "AFRICA"
    ]).optional(),
    teamSize: z.enum(["2", "4"]).transform((v) => Number(v)).optional(),
    averagePeakRank: z.string().optional()
  })
).output(
  TeamSchema.extend({
    memberships: z.array(
      z.object({
        id: z.string(),
        role: TeamMemberRoleSchema,
        isCreator: z.boolean()
      })
    )
  })
).mutation(async ({ input: { name, region, teamSize, averagePeakRank }, ctx: { user } }) => {
  const team = await prisma.team.create({
    data: {
      name,
      region,
      status: "UNASSIGNED",
      // store preference for later assignment
      // @ts-expect-error column may not exist locally yet until DDL applied
      preferredTeamSize: teamSize,
      averagePeakRank,
      memberships: {
        create: {
          userId: user.id,
          role: TeamMemberRoleSchema.Values.OWNER,
          isCreator: true
        }
      }
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      memberships: {
        select: {
          id: true,
          role: true,
          isCreator: true
        }
      }
    }
  });
  return team;
});

const deleteTeam = protectedProcedure.input(
  z.object({
    id: z.string()
  })
).mutation(async ({ input: { id }, ctx: { abilities } }) => {
  try {
    if (!abilities.isTeamOwner(id)) {
      throw new TRPCError({
        code: "FORBIDDEN"
      });
    }
    await prisma.team.delete({
      where: {
        id
      }
    });
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

const invitationById = publicProcedure.input(
  z.object({
    id: z.string()
  })
).output(
  TeamInvitationSchema.extend({
    team: z.object({
      name: z.string()
    }).nullish()
  }).nullable()
).mutation(async ({ input: { id } }) => {
  const invitation = await prisma.teamInvitation.findUnique({
    where: {
      id
    },
    include: {
      team: {
        select: {
          name: true
        }
      }
    }
  });
  return invitation;
});

const invitations = protectedProcedure.input(
  z.object({
    teamId: z.string()
  })
).output(z.array(TeamInvitationSchema)).query(async ({ input: { teamId }, ctx: { abilities } }) => {
  if (!abilities.isTeamMember(teamId)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No permission to read the invitations for this team."
    });
  }
  const invitations2 = await prisma.teamInvitation.findMany({
    where: {
      teamId
    }
  });
  return invitations2;
});

const inviteMember = protectedProcedure.input(
  z.object({
    teamId: z.string(),
    email: z.string(),
    role: z.enum(["MEMBER", "OWNER"])
  })
).mutation(async ({ input: { teamId, email, role }, ctx: { abilities } }) => {
  if (!abilities.isTeamOwner(teamId)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No permission to add a member to this team."
    });
  }
  try {
    const team = await prisma.team.findUnique({ where: { id: teamId }, select: {
      divisionId: true,
      /* @ts-expect-error */
      preferredTeamSize: true
    } });
    const membershipCount = await prisma.teamMembership.count({ where: { teamId } });
    let maxRoster = 6;
    if (team == null ? void 0 : team.divisionId) {
      const division = await prisma.division.findUnique({ where: { id: team.divisionId }, select: { maxRoster: true } });
      if (division == null ? void 0 : division.maxRoster) maxRoster = division.maxRoster;
    } else if ((team == null ? void 0 : team.preferredTeamSize) === 2) {
      maxRoster = 3;
    }
    if (membershipCount >= maxRoster) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Roster is full" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "User not found. Ask the player to sign up first." });
    }
    await prisma.teamMembership.create({
      data: { teamId, userId: user.id, role }
    });
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not invite member."
    });
  }
});

const memberships = protectedProcedure.input(
  z.object({
    teamId: z.string()
  })
).output(
  z.array(
    TeamMembershipSchema.merge(
      z.object({
        user: UserSchema.optional()
      })
    )
  )
).query(async ({ input: { teamId }, ctx: { abilities } }) => {
  var _a, _b;
  if (!abilities.isTeamMember(teamId)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No permission to read the memberships for this team."
    });
  }
  const memberships2 = await prisma.teamMembership.findMany({
    where: {
      teamId
    }
  });
  const userIds = (_a = memberships2.map((m) => m.userId).filter((id) => !!id)) != null ? _a : [];
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds
      }
    }
  });
  return (_b = memberships2.map((m) => ({
    ...m,
    user: users.find((u) => u.id === m.userId)
  }))) != null ? _b : [];
});

const removeMember = protectedProcedure.input(
  z.object({
    membershipId: z.string()
  })
).mutation(async ({ input: { membershipId }, ctx: { abilities, user } }) => {
  const membership = await prisma.teamMembership.findUnique({
    where: {
      id: membershipId
    }
  });
  if (!membership)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Membership not found."
    });
  if (!abilities.isTeamOwner(membership.teamId) && membership.userId !== (user == null ? void 0 : user.id))
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No permission to remove a member from this team."
    });
  try {
    await prisma.teamMembership.delete({
      where: {
        id: membership.id
      }
    });
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could remove member."
    });
  }
});

const revokeInvitation = protectedProcedure.input(
  z.object({
    invitationId: z.string()
  })
).mutation(async ({ input: { invitationId }, ctx: { abilities } }) => {
  const invitation = await prisma.teamInvitation.findUnique({
    where: {
      id: invitationId
    },
    select: {
      id: true,
      teamId: true
    }
  });
  if (!invitation)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Invitation not found."
    });
  if (!abilities.isTeamOwner(invitation.teamId))
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No permission to add a member to this team."
    });
  try {
    await prisma.teamInvitation.delete({
      where: {
        id: invitationId
      }
    });
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could remove invitation."
    });
  }
});

const subscription = protectedProcedure.input(
  z.object({
    teamId: z.string()
  })
).output(SubscriptionSchema.nullable()).query(async ({ input: { teamId }, ctx: { abilities } }) => {
  if (!abilities.isTeamMember(teamId)) {
    throw new Error("Unauthorized");
  }
  const subscription2 = await prisma.subscription.findUnique({
    where: {
      teamId
    }
  });
  return subscription2;
});

const update = protectedProcedure.input(
  z.object({
    id: z.string(),
    name: z.string().optional(),
    avatarUrl: z.string().optional()
  })
).output(TeamSchema).mutation(
  async ({ input: { id, name, avatarUrl }, ctx: { abilities, user } }) => {
    if (!abilities.isTeamOwner(id)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No permission to update this team."
      });
    }
    const team = await prisma.team.update({
      where: {
        id
      },
      data: {
        name,
        avatarUrl
      }
    });
    return team;
  }
);

const updateMembership = protectedProcedure.input(
  TeamMembershipSchema.pick({
    id: true,
    role: true
  })
).mutation(
  async ({ input: { id, role }, ctx: { abilities, user, isAdmin } }) => {
    const membership = await prisma.teamMembership.findUnique({
      where: {
        id
      }
    });
    if (!membership) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Membership not found."
      });
    }
    if (!isAdmin && !abilities.isTeamOwner(membership.teamId)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No permission to remove a member from this team."
      });
    }
    try {
      await prisma.teamMembership.update({
        where: {
          id: membership.id
        },
        data: {
          role
        }
      });
    } catch (e) {
      logger.error(e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not update member."
      });
    }
  }
);

const joinLadder = protectedProcedure.input(
  z.object({
    teamId: z.string(),
    region: z.enum([
      "US_EAST",
      "US_WEST",
      "EUROPE",
      "ASIA",
      "AU_NZ",
      "SOUTH_AMERICA",
      "AFRICA"
    ]),
    teamSize: z.enum(["2", "4"]).transform((v) => Number(v)),
    level: z.number().int().min(1).default(1)
  })
).mutation(async ({ input: { teamId, region, teamSize, level }, ctx: { abilities } }) => {
  if (!abilities.isTeamOwner(teamId)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Only owners can join a ladder" });
  }
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
  const season = await prisma.season.findFirst({ orderBy: { createdAt: "desc" } });
  if (!season) throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" });
  const division = await prisma.division.findFirst({
    where: { seasonId: season.id, region, level, teamSize },
    orderBy: { id: "asc" }
  });
  if (!division) throw new TRPCError({ code: "NOT_FOUND", message: "No division for selection" });
  await prisma.team.update({
    where: { id: teamId },
    data: { region, divisionId: division.id, seasonId: season.id }
  });
  return { ok: true, divisionId: division.id };
});

const roster = protectedProcedure.input(z.object({ teamId: z.string() })).output(
  z.array(
    z.object({
      id: z.string(),
      teamId: z.string(),
      userId: z.string(),
      role: z.enum(["MEMBER", "OWNER"]),
      isCreator: z.boolean(),
      gamerTag: z.string().nullable().optional(),
      platform: z.string().nullable().optional(),
      isSub: z.boolean().optional(),
      user: UserSchema.optional()
    })
  )
).query(async ({ input: { teamId }, ctx: { abilities } }) => {
  if (!abilities.isTeamMember(teamId)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No permission" });
  }
  const list = await prisma.teamMembership.findMany({ where: { teamId } });
  const users = await prisma.user.findMany({ where: { id: { in: list.map((m) => m.userId) } } });
  return list.map((m) => ({ ...m, user: users.find((u) => u.id === m.userId) }));
});

const updateRoster = protectedProcedure.input(
  z.object({
    membershipId: z.string(),
    gamerTag: z.string().optional().nullable(),
    platform: z.string().optional().nullable(),
    isSub: z.boolean().optional()
  })
).mutation(async ({ input: { membershipId, gamerTag, platform, isSub }, ctx: { abilities } }) => {
  const membership = await prisma.teamMembership.findUnique({ where: { id: membershipId } });
  if (!membership) throw new TRPCError({ code: "NOT_FOUND", message: "Membership not found" });
  if (!abilities.isTeamOwner(membership.teamId)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Only owner can edit roster" });
  }
  await prisma.teamMembership.update({
    where: { id: membershipId },
    data: {
      gamerTag: gamerTag != null ? gamerTag : void 0,
      platform: platform != null ? platform : void 0,
      isSub: typeof isSub === "boolean" ? isSub : void 0
    }
  });
  return { ok: true };
});

const assignDivision = protectedProcedure.input(z.object({ teamId: z.string(), divisionId: z.string() })).mutation(async ({ input: { teamId, divisionId }, ctx: { isAdmin } }) => {
  if (!isAdmin) throw new TRPCError({ code: "UNAUTHORIZED" });
  const division = await prisma.division.findUnique({ where: { id: divisionId } });
  if (!division) throw new TRPCError({ code: "NOT_FOUND", message: "Division not found" });
  await prisma.team.update({
    where: { id: teamId },
    data: { divisionId, seasonId: division.seasonId, region: division.region, status: "ASSIGNED" }
  });
  return { ok: true };
});

const setStatus = protectedProcedure.input(z.object({ teamId: z.string(), status: z.enum(["UNASSIGNED", "ASSIGNED", "WAITLIST", "ACTIVE"]) })).mutation(async ({ input: { teamId, status }, ctx: { isAdmin } }) => {
  if (!isAdmin) throw new TRPCError({ code: "UNAUTHORIZED" });
  await prisma.team.update({ where: { id: teamId }, data: { status } });
  return { ok: true };
});

const players = protectedProcedure.input(z.object({ teamId: z.string() })).query(async ({ input: { teamId }, ctx: { abilities } }) => {
  if (!abilities.isTeamMember(teamId)) throw new TRPCError({ code: "UNAUTHORIZED" });
  return await prisma.teamPlayer.findMany({ where: { teamId }, orderBy: { createdAt: "asc" } });
});
const addPlayer = protectedProcedure.input(z.object({ teamId: z.string(), name: z.string().min(1), gamerTag: z.string().optional(), platform: z.string().optional(), role: z.string().optional(), isSub: z.boolean().optional() })).mutation(async ({ input: { teamId, name, gamerTag, platform, role, isSub }, ctx: { abilities } }) => {
  if (!abilities.isTeamOwner(teamId)) throw new TRPCError({ code: "UNAUTHORIZED" });
  return await prisma.teamPlayer.create({ data: { teamId, name, gamerTag, platform, role, isSub: !!isSub } });
});
const updatePlayer = protectedProcedure.input(z.object({ id: z.string(), name: z.string().optional(), gamerTag: z.string().optional().nullable(), platform: z.string().optional().nullable(), role: z.string().optional().nullable(), isSub: z.boolean().optional() })).mutation(async ({ input: { id, ...data }, ctx: { abilities } }) => {
  const player = await prisma.teamPlayer.findUnique({ where: { id } });
  if (!player) throw new TRPCError({ code: "NOT_FOUND" });
  if (!abilities.isTeamOwner(player.teamId)) throw new TRPCError({ code: "UNAUTHORIZED" });
  return await prisma.teamPlayer.update({ where: { id }, data: { ...data } });
});
const removePlayer = protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input: { id }, ctx: { abilities } }) => {
  const player = await prisma.teamPlayer.findUnique({ where: { id } });
  if (!player) throw new TRPCError({ code: "NOT_FOUND" });
  if (!abilities.isTeamOwner(player.teamId)) throw new TRPCError({ code: "UNAUTHORIZED" });
  await prisma.teamPlayer.delete({ where: { id } });
  return { ok: true };
});

const teamProcedures = /*#__PURE__*/Object.freeze({
  __proto__: null,
  acceptInvitation: acceptInvitation,
  addPlayer: addPlayer,
  assignDivision: assignDivision,
  byId: byId,
  create: create,
  deleteTeam: deleteTeam,
  invitationById: invitationById,
  invitations: invitations,
  inviteMember: inviteMember,
  joinLadder: joinLadder,
  memberships: memberships,
  players: players,
  removeMember: removeMember,
  removePlayer: removePlayer,
  revokeInvitation: revokeInvitation,
  roster: roster,
  setStatus: setStatus,
  subscription: subscription,
  update: update,
  updateMembership: updateMembership,
  updatePlayer: updatePlayer,
  updateRoster: updateRoster
});

const signedUploadUrl = protectedProcedure.input(
  z.object({
    bucket: z.string().min(1),
    path: z.string().min(1)
  })
).mutation(async ({ input: { bucket, path } }) => {
  if (bucket === process.env.NUXT_PUBLIC_S3_AVATARS_BUCKET_NAME) {
    return await getSignedUploadUrl(path, { bucket });
  }
  throw new TRPCError({
    code: "FORBIDDEN"
  });
});

const uploadsProcedures = /*#__PURE__*/Object.freeze({
  __proto__: null,
  signedUploadUrl: signedUploadUrl
});

const apiRouter = router({
  auth: router(authProcedures),
  billing: router(billingProcedures),
  team: router(teamProcedures),
  newsletter: router(newsletterProcedures),
  ai: router(aiProcedures),
  uploads: router(uploadsProcedures),
  admin: router(adminProcedures)
});

function defineAbilitiesFor({
  user,
  teamMemberships
}) {
  const isAdmin = (user == null ? void 0 : user.role) === UserRoleSchema.Values.ADMIN;
  const getTeamRole = (teamId) => {
    var _a, _b;
    return (_b = (_a = teamMemberships == null ? void 0 : teamMemberships.find((m) => m.teamId === teamId)) == null ? void 0 : _a.role) != null ? _b : null;
  };
  const isTeamOwner = (teamId) => isAdmin || getTeamRole(teamId) === TeamMemberRoleSchema.Values.OWNER;
  const isTeamMember = (teamId) => isTeamOwner(teamId) || getTeamRole(teamId) === TeamMemberRoleSchema.Values.MEMBER;
  return {
    isAdmin,
    isTeamMember,
    isTeamOwner
  };
}

async function createContext(event) {
  var _a, _b;
  const sessionId = event && "node" in event && ((_a = parseCookies(event)) == null ? void 0 : _a[config.auth.sessionCookieName]) || null;
  const { user, session } = sessionId ? await validateSessionToken(sessionId) : { user: null, session: null };
  const teamMemberships = user ? await Promise.all(
    (await prisma.teamMembership.findMany({
      where: {
        userId: user.id
      },
      include: {
        team: true
      }
    })).map(async (membership) => ({
      ...membership,
      team: {
        ...membership.team,
        avatarUrl: membership.team.avatarUrl ? await getSignedUrl(membership.team.avatarUrl, {
          bucket: process.env.NUXT_PUBLIC_S3_AVATARS_BUCKET_NAME,
          expiresIn: 360
        }) : null
      }
    }))
  ) : null;
  const abilities = defineAbilitiesFor({
    user,
    teamMemberships
  });
  const locale = event && "node" in event && ((_b = parseCookies(event)) == null ? void 0 : _b[config.i18n.cookieName]) || config.i18n.defaultLocale;
  return {
    user,
    teamMemberships,
    abilities,
    session,
    locale,
    isAdmin: event && "isAdmin" in event ? event.isAdmin : false,
    event: event && "node" in event ? event : void 0
  };
}

export { createCallerFactory as a, apiRouter as b, createContext as c, logger as l };
//# sourceMappingURL=context.mjs.map
