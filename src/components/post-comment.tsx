'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { formatTimeToNow } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import { Comment, CommentVote, User } from '@prisma/client';
import { MessageSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import CommentVotes from './comment-votes';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import UserAvatar from './user-avatar';

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

type Props = {
  comment: ExtendedComment;
  postId: string;
  votesAmount: number;
  currentVote: CommentVote | undefined;
};

export default function PostComment({
  comment,
  currentVote,
  postId,
  votesAmount,
}: Props) {
  const commentRef = useRef<HTMLDivElement>(null);

  const [isReplying, setIsReplying] = useState(false);
  const [input, setInput] = useState('');

  const { data: session } = useSession();
  const router = useRouter();
  const { loginToast } = useCustomToast();

  const { mutate: postComment, isPending } = trpc.comment.create.useMutation({
    onSuccess: () => {
      router.refresh();
      setIsReplying(false);
      setInput('');
    },
    onError: (err) => {
      if (err.data?.code === 'UNAUTHORIZED') return loginToast();

      toast.error('Something went wrong.', {
        description: 'Please try again later.',
      });
    },
  });

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
          className="size-6"
        />

        <div className="flex items-center gap-x-2 ml-2">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
            u/{comment.author.username}
          </p>
          <p className="max-h-40 truncate text-xs text-muted-foreground">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="text-sm text-zinc-900 dark:text-primary-foreground mt-2">
        {comment.text}
      </p>

      <div className="flex items-center flex-wrap gap-2">
        <CommentVotes
          commentId={comment.id}
          initialVotesAmount={votesAmount}
          initialVote={currentVote}
        />

        <Button
          onClick={() => {
            if (!session) return router.push('/sign-in');
            setIsReplying(true);
          }}
          variant="ghost"
          size="sm"
        >
          <MessageSquare className="size-4 mr-1.5" />
          Reply
        </Button>

        {isReplying && (
          <div className="grid w-full gap-1.5">
            <Label htmlFor="comment">Your comment</Label>
            <div className="mt-2">
              <Textarea
                id="comment"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="What are your thoughts?"
              />

              <div className="flex justify-end mt-2 gap-2">
                <Button
                  onClick={() => setIsReplying(false)}
                  tabIndex={-1}
                  variant="secondary"
                >
                  Cancel
                </Button>

                <Button
                  onClick={() =>
                    postComment({
                      postId,
                      text: input,
                      replyToId: comment.replyToId ?? comment.id,
                    })
                  }
                  isPending={isPending}
                  disabled={input.length === 0}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
