import prisma from '@/lib/prisma';
import {
  CommunitySchema,
  CommunitySubscriptionSchema,
} from '@/schemas/community';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { authedProcedure, publicProcedure, router } from '../trpc';

export const communityRouter = router({
  create: authedProcedure
    .input(CommunitySchema)
    .mutation(async ({ ctx, input: { name } }) => {
      const existingCommunity = await prisma.community.findFirst({
        where: {
          name,
        },
      });

      if (existingCommunity) throw new TRPCError({ code: 'CONFLICT' });

      const community = await prisma.community.create({
        data: {
          name,
          creatorId: ctx.userId,
        },
      });

      // Subscribe to community
      const subscription = await prisma.subscription.create({
        data: {
          userId: ctx.userId,
          communityId: community.id,
        },
      });

      if (!community || !subscription)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      return { community };
    }),
  subscribe: authedProcedure
    .input(CommunitySubscriptionSchema)
    .mutation(async ({ ctx, input: { communityId } }) => {
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          communityId,
          userId: ctx.userId,
        },
      });

      if (existingSubscription)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are already subscribed to this community.',
        });

      const subscription = await prisma.subscription.create({
        data: {
          communityId,
          userId: ctx.userId,
        },
      });

      if (!subscription) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      return { subscription };
    }),
  unsubscribe: authedProcedure
    .input(CommunitySubscriptionSchema)
    .mutation(async ({ ctx: { userId }, input: { communityId } }) => {
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          communityId,
          userId,
        },
      });

      if (!existingSubscription)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are not subscribed to this community.',
        });

      // Check if user is the creator of the community
      const community = await prisma.community.findFirst({
        where: {
          id: communityId,
          creatorId: userId,
        },
      });
      if (community) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You can not unsubscribe from your own community.',
        });
      }

      const deleted = await prisma.subscription.delete({
        where: {
          id: existingSubscription.id,
        },
      });

      if (!deleted) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      return { subscription: deleted };
    }),
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ input: { query } }) => {
      // if (!query) throw new TRPCError({ code: 'BAD_REQUEST' });
      if (!query) return { communities: [] };

      const results = await prisma.community.findMany({
        where: {
          name: {
            startsWith: query,
          },
        },
        include: {
          _count: true,
        },
        take: 5,
      });

      return { communities: results };
    }),
});
