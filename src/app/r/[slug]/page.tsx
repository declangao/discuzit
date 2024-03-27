import CreatePostMini from '@/app/r/_components/create-post-mini';
import PostFeed from '@/components/post-feed';
import { INFINITE_SCROLLING_PAGE_SIZE } from '@/config';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

type Props = {
  params: {
    slug: string;
  };
};

export default async function CommunityPage({ params: { slug } }: Props) {
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
          comments: true,
          community: true,
        },
        take: INFINITE_SCROLLING_PAGE_SIZE,
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!community) return notFound();

  return (
    <>
      <h1 className="hidden md:block font-bold text-3xl md:text-4xl h-14">
        r/{community.name}
      </h1>

      <CreatePostMini session={session} />

      <PostFeed initialPosts={community.posts} communityName={community.name} />
    </>
  );
}
