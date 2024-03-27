import { INFINITE_SCROLLING_PAGE_SIZE } from '@/config';
import prisma from '@/lib/prisma';
import { PostSchema } from '@/schemas/post';
import { PostVoteSchema } from '@/schemas/vote';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { authedProcedure, router, universalProcedure } from '../trpc';

export const postRouter = router({
  create: authedProcedure
    .input(PostSchema)
    .mutation(async ({ ctx: { userId }, input }) => {
      const { communityId, title, content } = input;

      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          communityId,
          userId,
        },
      });

      if (!existingSubscription)
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You need to subscribe to this community in order to post.',
        });

      const post = await prisma.post.create({
        data: {
          title,
          content,
          communityId,
          authorId: userId,
        },
      });

      if (!post) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      return { post };
    }),

  vote: authedProcedure
    .input(PostVoteSchema)
    .mutation(async ({ ctx: { userId }, input }) => {
      const { postId, voteType } = input;

      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        include: {
          author: true,
          votes: true,
        },
      });

      if (!post)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });

      const existingVote = await prisma.vote.findFirst({
        where: {
          userId,
          postId,
        },
      });

      // Already voted before
      if (existingVote) {
        // Same vote, cancel previous one
        if (existingVote.type === voteType) {
          const deleted = await prisma.vote.delete({
            where: {
              id: existingVote.id,
            },
          });

          if (!deleted) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

          return { vote: deleted };
        }

        // Different vote - update previous one
        const updated = await prisma.vote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            type: voteType,
          },
        });

        if (!updated) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        return { vote: updated };
      }

      // Not voted before
      const newVote = await prisma.vote.create({
        data: {
          type: voteType,
          userId,
          postId,
        },
      });

      if (!newVote) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      return { vote: newVote };
    }),

  infinitePosts: universalProcedure
    .input(
      z.object({
        communityName: z.string().nullish().optional(),
        limit: z.number().min(1).max(100).optional(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx: { userId }, input }) => {
      let followedCommunityIds: string[] = [];

      if (userId) {
        const subscriptions = await prisma.subscription.findMany({
          where: {
            userId,
          },
          include: {
            community: true,
          },
        });

        followedCommunityIds = subscriptions.map(
          ({ community }) => community.id
        );
      }

      const {
        communityName,
        cursor,
        limit = INFINITE_SCROLLING_PAGE_SIZE,
        // page = 1,
      } = input;

      let where;
      if (communityName) {
        // Specific community
        where = {
          community: {
            name: communityName,
          },
        };
      } else if (userId) {
        // Followed communities
        where = {
          community: {
            id: {
              in: followedCommunityIds,
            },
          },
        };
      }

      const posts = await prisma.post.findMany({
        where,
        // take: limit + 1,
        take: limit,
        skip: cursor ? 1 : 0,

        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          community: true,
          votes: true,
          author: true,
          comments: true,
        },
      });

      if (!posts) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length >= limit) {
        const lastItem = posts[posts.length - 1];
        nextCursor = lastItem!.id;
      }
      return {
        posts,
        nextCursor,
      };
    }),
});
