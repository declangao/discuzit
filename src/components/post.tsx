import { formatTimeToNow } from '@/lib/utils';
import { ExtendedPost } from '@/types/db';
import { Vote } from '@prisma/client';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import EditorOutput from './editor-output';
import PostVoteClient from './post-vote/post-vote-client';

type PartialVote = Pick<Vote, 'type'>;

type Props = {
  post: ExtendedPost;
  votesAmount: number;
  currentVote?: PartialVote;
};

export default function Post({ post, votesAmount, currentVote }: Props) {
  const postRef = useRef<HTMLDivElement>(null);

  return (
    <div className="rounded-md bg-white dark:bg-zinc-900 shadow">
      <div className="px-6 py-4 flex justify-between">
        <PostVoteClient
          postId={post.id}
          initialVote={currentVote?.type}
          initialVotesAmount={votesAmount}
          classname="hidden md:block md:w-fit"
        />

        <div className="w-full flex-1">
          <div className="max-h-40 mt-1 text-xs text-muted-foreground">
            {post.community?.name && (
              <>
                <a
                  href={`/r/${post.community.name}`}
                  className="underline text-zinc-900 dark:text-zinc-100 text-sm underline-offset-2"
                >
                  r/{post.community.name}
                </a>
                <span className="px-1">•</span>
              </>
            )}
            <span className="">Posted by u/{post.author.username}</span>{' '}
            {formatTimeToNow(new Date(post.createdAt))}
          </div>

          <a href={`/r/${post.community.name}/post/${post.id}`}>
            <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900 dark:text-zinc-50">
              {post.title}
            </h1>
          </a>

          <div
            ref={postRef}
            className="relative text-sm max-h-40 w-full overflow-clip"
          >
            <EditorOutput content={post.content} />

            {postRef.current?.clientHeight === 160 ? (
              // blur bottom if content is too long
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent dark:from-zinc-900" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex gap-4 rounded-md bg-gray-50 dark:bg-zinc-800 z-20 text-sm p-3 sm:px-6">
        <PostVoteClient
          postId={post.id}
          initialVote={currentVote?.type}
          initialVotesAmount={votesAmount}
          classname="visible md:hidden p-0 items-center"
        />

        <Link
          href={`/r/${post.community.name}/post/${post.id}`}
          className="w-fit flex items-center gap-2"
        >
          <MessageSquare className="size-4" /> {post.comments.length} comments
        </Link>
      </div>
    </div>
  );
}
