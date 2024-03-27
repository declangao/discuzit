'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

type Props = {
  postId: string;
  replyToId?: string;
};

export default function CreateComment({ postId, replyToId }: Props) {
  const [input, setInput] = useState('');

  const router = useRouter();
  const { loginToast } = useCustomToast();

  const { mutate: postComment, isPending } = trpc.comment.create.useMutation({
    onSuccess: () => {
      router.refresh();
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

        <div className="flex justify-end mt-2">
          <Button
            onClick={() => postComment({ postId, text: input, replyToId })}
            isPending={isPending}
            disabled={input.length === 0}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}
