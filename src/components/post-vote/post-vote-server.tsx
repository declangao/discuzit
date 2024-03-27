import { getAuthSession } from '@/lib/auth';
import { Post, Vote, VoteType } from '@prisma/client';
import { notFound } from 'next/navigation';
import PostVoteClient from './post-vote-client';

type Props = {
  postId: string;
  initialVote?: VoteType | null;
  initialVotesAmount?: number;
  getData?: () => Promise<(Post & { votes: Vote[] }) | null>;
};

export default async function PostVoteServer({
  postId,
  initialVote,
  initialVotesAmount,
  getData,
}: Props) {
  const session = await getAuthSession();

  let _votesAmount = 0;
  let _currentVote: VoteType | null | undefined = undefined;

  if (getData) {
    const post = await getData();
    if (!post) return notFound();

    _votesAmount = post.votes.reduce((acc, vote) => {
      if (vote.type === 'UP') return acc + 1;
      if (vote.type === 'DOWN') return acc - 1;
      return acc;
    }, 0);

    _currentVote = post.votes.find(
      (vote) => vote.userId === session?.user.id
    )?.type;
  } else {
    _votesAmount = initialVotesAmount!;
    _currentVote = initialVote;
  }

  return (
    <PostVoteClient
      postId={postId}
      initialVote={_currentVote}
      initialVotesAmount={_votesAmount}
    />
  );
}
