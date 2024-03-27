import CommentsSection from '@/components/comments-section';
import EditorOutput from '@/components/editor-output';
import PostVoteServer from '@/components/post-vote/post-vote-server';
import { buttonVariants } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import { formatTimeToNow } from '@/lib/utils';
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type Props = {
  params: {
    postId: string;
  };
};

export default async function PostDetailPage({ params: { postId } }: Props) {
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
    },
    include: {
      votes: true,
      author: true,
    },
  });

  if (!post) return notFound();

  return (
    <div>
      <div className="h-full flex flex-col sm:flex-row items-center sm:items-start justify-between">
        <Suspense fallback={<PostVoteSkeleton />}>
          <PostVoteServer
            postId={postId}
            getData={async () => {
              return await prisma.post.findUnique({
                where: {
                  id: postId,
                },
                include: {
                  votes: true,
                },
              });
            }}
          />
        </Suspense>

        <div className="w-full sm:w-0 flex-1 bg-white dark:bg-zinc-900 p-4 rounded-sm">
          <p className="max-h-40 mt-1 truncate text-xs text-gray-500 dark:text-muted-foreground">
            Posted by /u{post?.author.username}{' '}
            {formatTimeToNow(new Date(post?.createdAt))}
          </p>
          <h1 className="text-xl font-semibold py-2 leading-6 text-gray-900 dark:text-primary-foreground">
            {post?.title}
          </h1>

          <EditorOutput content={post?.content} />

          <Suspense
            fallback={<Loader2 className="size-5 animate-spin text-zinc-500" />}
          >
            <CommentsSection postId={postId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function PostVoteSkeleton() {
  return (
    <div className="flex flex-col items-center pr-6 w-20">
      <div className={buttonVariants({ variant: 'ghost' })}>
        <ArrowBigUp className="size-5 text-zinc-700" />
      </div>

      <div className="text-center py-2 font-medium text-sm text-zinc-900">
        <Loader2 className="size-3 animate-spin" />
      </div>

      <div className={buttonVariants({ variant: 'ghost' })}>
        <ArrowBigDown className="size-5 text-zinc-700" />
      </div>
    </div>
  );
}
