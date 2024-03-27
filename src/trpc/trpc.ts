import { getAuthSession } from '@/lib/auth';
import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create({
  transformer: superjson,
  // Optional - add zod error
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause // error.cause.flatten()
            : null,
      },
    };
  },
});

const middleware = t.middleware;

const authMiddleware = middleware(async (options) => {
  const session = await getAuthSession();

  if (!session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' });

  return options.next({
    ctx: {
      userId: session?.user.id,
      user: session?.user,
    },
  });
});

// Both authed and unauthed users
const universalMiddleware = middleware(async (options) => {
  const session = await getAuthSession();

  return options.next({
    ctx: {
      userId: session?.user.id,
    },
  });
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const authedProcedure = t.procedure.use(authMiddleware);
export const universalProcedure = t.procedure.use(universalMiddleware);
