import JoinOrLeaveToggle from '@/components/join-or-leave-toggle';
import { buttonVariants } from '@/components/ui/button';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  slug: string;
};

export default async function CommunityInfoCard({ slug }: Props) {
  const session = await getAuthSession();

  const community = await prisma.community.findFirst({
    where: {
      name: slug,
    },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  if (!community) return notFound();

  const subscription = !session?.user
    ? undefined
    : await prisma.subscription.findFirst({
        where: {
          community: {
            name: slug,
          },
          userId: session.user.id,
        },
      });

  const isSubscribed = !!subscription;

  const memberCount = await prisma.subscription.count({
    where: {
      community: {
        name: slug,
      },
    },
  });

  return (
    <div className="overflow-hidden h-fit rounded-lg border border-gray-200 dark:border-gray-800 order-first md:order-last">
      <div className="flex justify-between px-6 py-3 md:py-4">
        <span className="font-medium md:font-semibold py-3">
          About r/{community.name}
        </span>
        <div className="block md:hidden">
          {community.creatorId === session?.user.id ? (
            <div className="flex justify-between gap-x-4 py-3">
              <p className="text-gray-500">You created this community.</p>
            </div>
          ) : (
            <JoinOrLeaveToggle
              communityId={community.id}
              communityName={community.name}
              isSubscribed={isSubscribed}
            />
          )}
        </div>
      </div>

      <dl className="divide-y divide-gray-100 dark:divide-gray-800 px-6 py-1 md:py-4 text-sm leading-6 bg-white dark:bg-zinc-900">
        <div className="flex justify-between gap-x-4 py-1 md:py-3">
          <dt className="text-gray-500 dark:text-zinc-100">Created</dt>
          <dd className="text-gray-700 dark:text-zinc-200">
            <time dateTime={community.createdAt.toDateString()}>
              {format(community.createdAt, 'MMMM d, yyyy')}
            </time>
          </dd>
        </div>

        <div className="flex justify-between gap-x-4 py-1 md:py-3">
          <dt className="text-gray-500 dark:text-zinc-100">Members</dt>
          <dd className="text-gray-700 dark:text-zinc-200">{memberCount}</dd>
        </div>

        <div className="hidden md:block">
          {community.creatorId === session?.user.id ? (
            <div className="flex justify-between gap-x-4 py-3">
              <p className="text-muted-foreground">
                You created this community.
              </p>
            </div>
          ) : (
            <JoinOrLeaveToggle
              communityId={community.id}
              communityName={community.name}
              isSubscribed={isSubscribed}
            />
          )}

          <Link
            href={`/r/${slug}/submit`}
            className={buttonVariants({
              variant: 'secondary',
              className: 'w-full mt-4 mb-6',
            })}
          >
            Create Post
          </Link>
        </div>
      </dl>
    </div>
  );
}
