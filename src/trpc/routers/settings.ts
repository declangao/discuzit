import prisma from '@/lib/prisma';
import { UsernameSchema } from '@/schemas/username';
import { TRPCError } from '@trpc/server';
import { authedProcedure, router } from '../trpc';

export const settingsRouter = router({
  changeUsername: authedProcedure
    .input(UsernameSchema)
    .mutation(async ({ ctx: { userId }, input: { name } }) => {
      const existingUsername = await prisma.user.findFirst({
        where: {
          username: name,
        },
      });

      if (existingUsername)
        throw new TRPCError({ code: 'CONFLICT', message: 'Username is taken' });

      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          username: name,
        },
      });

      if (!user) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      return { user };
    }),
});
