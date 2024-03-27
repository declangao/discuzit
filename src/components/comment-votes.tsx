'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { usePrevious } from '@/hooks/use-previous';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import { CommentVote } from '@prisma/client';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';

type Props = {
  commentId: string;
  initialVote?: Pick<CommentVote, 'type'>;
  initialVotesAmount: number;
};

export default function CommentVotes({
  commentId,
  initialVote,
  initialVotesAmount,
}: Props) {
  const [votesAmount, setVotesAmount] = useState(initialVotesAmount);
  const [currentVote, setCurrentVote] = useState(initialVote);

  const { loginToast } = useCustomToast();
  const previousVote = usePrevious(currentVote);

  const { mutate: vote } = trpc.comment.vote.useMutation({
    onMutate: ({ voteType }) => {
      if (currentVote?.type === voteType) {
        setCurrentVote(undefined);
        if (voteType === 'UP') setVotesAmount((prev) => prev - 1);
        else if (voteType === 'DOWN') setVotesAmount((prev) => prev + 1);
      } else {
        setCurrentVote({ type: voteType });
        // If previously voted, add 2; otherwise add 1
        if (voteType === 'UP')
          setVotesAmount((prev) => prev + (currentVote ? 2 : 1));
        else if (voteType === 'DOWN')
          setVotesAmount((prev) => prev - (currentVote ? 2 : 1));
      }
    },
    onError: (err, { voteType }) => {
      // Reset vote count
      if (voteType === 'UP') setVotesAmount((prev) => prev - 1);
      else setVotesAmount((prev) => prev + 1);

      // Reset current vote
      setCurrentVote(previousVote);

      if (err.data?.code === 'UNAUTHORIZED') {
        return loginToast();
      }

      toast.error('Something went wrong.', {
        description: 'Please try again later.',
      });
    },
  });

  return (
    <div className="flex gap-1">
      <Button
        onClick={() => vote({ commentId, voteType: 'UP' })}
        size="sm"
        variant="ghost"
        aria-label="Upvote"
      >
        <ArrowBigUp
          className={cn('size-5 text-zinc-700', {
            'text-emerald-500 fill-emerald-500': currentVote?.type === 'UP',
          })}
        />
      </Button>

      <p className="text-center py-2 font-medium text-sm text-muted-foreground">
        {votesAmount}
      </p>

      <Button
        onClick={() => vote({ commentId, voteType: 'DOWN' })}
        size="sm"
        variant="ghost"
        aria-label="Downvote"
      >
        <ArrowBigDown
          className={cn('size-5 text-zinc-700', {
            'text-red-500 fill-red-500': currentVote?.type === 'DOWN',
          })}
        />
      </Button>
    </div>
  );
}
