'use client';

import { useIntersection } from '@/hooks/use-intersection';
import { trpc } from '@/trpc/client';
import { ExtendedPost } from '@/types/db';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import Post from './post';

type Props = {
  initialPosts: ExtendedPost[];
  communityName?: string;
};

export default function PostFeed({ initialPosts, communityName }: Props) {
  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const { data: session } = useSession();

  const { data, fetchNextPage, isFetchingNextPage, isError, error } =
    trpc.post.infinitePosts.useInfiniteQuery(
      { communityName },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialData: {
          pages: [
            {
              posts: initialPosts || [],
              nextCursor: initialPosts[initialPosts.length - 1]?.id || '',
            },
          ],
          pageParams: [],
        },
      }
    );

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  useEffect(() => {
    if (isError && error.data?.code === 'INTERNAL_SERVER_ERROR') {
      toast.error('Something went wrong.', {
        description: 'Please try again later.',
      });
    }
  }, [isError, error]);

  const posts = data?.pages.flatMap((page) => page.posts) ?? initialPosts;

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.length === 0 && (
        <div className="w-full text-center">
          <h3 className="font-medium text-lg">
            No post found. Try posting something :)
          </h3>
        </div>
      )}

      {posts.map((post, index) => {
        const votesAmount = post.votes.reduce((prev, curr) => {
          if (curr.type === 'UP') return prev + 1;
          if (curr.type === 'DOWN') return prev - 1;
          return prev;
        }, 0);

        const currentVote = post.votes.find(
          (vote) => vote.userId === session?.user.id
        );

        if (index === posts.length - 1)
          return (
            <li key={post.id} ref={ref} data-last>
              <Post
                post={post}
                votesAmount={votesAmount}
                currentVote={currentVote}
              />
            </li>
          );
        else
          return (
            <li key={post.id}>
              <Post
                post={post}
                votesAmount={votesAmount}
                currentVote={currentVote}
              />
            </li>
          );
      })}

      {isFetchingNextPage && (
        <li>
          <div className="w-full flex justify-center">
            <Loader2 className="size-6 animate-spin" />
          </div>
        </li>
      )}
    </ul>
  );
}
