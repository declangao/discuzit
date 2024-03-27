import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import CreateComment from './create-comment';
import PostComment from './post-comment';

type Props = {
  postId: string;
};

export default async function CommentsSection({ postId }: Props) {
  const session = await getAuthSession();

  const comments = await prisma.comment.findMany({
    where: {
      postId,
      replyToId: null, // Only fetch top level comments
    },
    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
        // orderBy: {
        //   createdAt: 'desc'
        // }
      },
    },
  });

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-6" />

      {/* TODO: merge CreateComment and PostComment into one */}
      <CreateComment postId={postId} />

      <div className="flex flex-col gap-y-6 mt-4">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const topLevelCommentVotesAmount = topLevelComment.votes.reduce(
              (acc, vote) => {
                if (vote.type === 'UP') return acc + 1;
                if (vote.type === 'DOWN') return acc - 1;
                return acc;
              },
              0
            );

            const topLevelCommentVote = topLevelComment.votes.find(
              (vote) => vote.userId === session?.user.id
            );

            return (
              <div key={topLevelComment.id} className="flex flex-col">
                <div className="mb-2">
                  <PostComment
                    comment={topLevelComment}
                    postId={postId}
                    currentVote={topLevelCommentVote}
                    votesAmount={topLevelCommentVotesAmount}
                  />
                </div>

                {/* Replies */}
                {topLevelComment.replies
                  .sort((a, b) => b.votes.length - a.votes.length) // Sort by most voted(liked or disliked)
                  .map((reply) => {
                    const replyVotesAmount = reply.votes.reduce((acc, vote) => {
                      if (vote.type === 'UP') return acc + 1;
                      if (vote.type === 'DOWN') return acc - 1;
                      return acc;
                    }, 0);

                    const replyVote = reply.votes.find(
                      (vote) => vote.userId === session?.user.id
                    );

                    return (
                      <div
                        key={reply.id}
                        className="ml-2 py-2 pl-4 border-l-2 border-zinc-200 dark:border-zinc-700"
                      >
                        <PostComment
                          comment={reply}
                          currentVote={replyVote}
                          votesAmount={replyVotesAmount}
                          postId={postId}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
}
