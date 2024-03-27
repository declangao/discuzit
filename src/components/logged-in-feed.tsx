import { INFINITE_SCROLLING_PAGE_SIZE } from '@/config';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import PostFeed from './post-feed';

// Feed for logged in users
export default async function LoggedInFeed() {
  const session = await getAuthSession();

  const joinedCommunities = await prisma.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
    include: {
      community: true,
    },
  });

  const where =
    // Show general feed if the user has not subscribed to any community
    joinedCommunities.length > 0
      ? {
          community: {
            name: {
              in: joinedCommunities.map(({ community }) => community.name),
            },
          },
        }
      : {};

  const posts = await prisma.post.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      community: true,
    },
    take: INFINITE_SCROLLING_PAGE_SIZE,
  });

  return <PostFeed initialPosts={posts} />;
}
