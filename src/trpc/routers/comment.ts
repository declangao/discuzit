import prisma from '@/lib/prisma';
import { CommentSchema } from '@/schemas/comment';
import { CommentVoteSchema } from '@/schemas/vote';
import { CommentVote } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { authedProcedure, router } from '../trpc';

export const commentRouter = router({
  create: authedProcedure
    .input(CommentSchema)
    .mutation(async ({ ctx: { userId }, input }) => {
      // Set replyToId default to null so mongodb can fetch only top level comments
      // MySQL doesn't need a default value
      const { postId, text, replyToId = null } = input;

      const comment = await prisma.comment.create({
        data: {
          postId,
          text,
          replyToId,
          authorId: userId,
        },
      });

      if (!comment) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      return { comment };
    }),
  vote: authedProcedure
    .input(CommentVoteSchema)
    .mutation(async ({ ctx: { userId }, input }) => {
      const { commentId, voteType } = input;

      const existingVote = await prisma.commentVote.findFirst({
        where: {
          userId,
          commentId,
        },
      });

      let vote: CommentVote;

      // Already voted before
      if (existingVote) {
        // Same vote, cancel previous one
        if (existingVote.type === voteType) {
          vote = await prisma.commentVote.delete({
            where: {
              id: existingVote.id,
            },
          });
        } else {
          // Different vote - update previous one
          vote = await prisma.commentVote.update({
            where: {
              id: existingVote.id,
            },
            data: {
              type: voteType,
            },
          });
        }
      } else {
        // Not voted before
        vote = await prisma.commentVote.create({
          data: {
            type: voteType,
            userId,
            commentId,
          },
        });
      }

      if (!vote) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      return { vote };
    }),
});
