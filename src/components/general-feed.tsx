import { INFINITE_SCROLLING_PAGE_SIZE } from '@/config';
import prisma from '@/lib/prisma';
import PostFeed from './post-feed';

// Feed for general public
export default async function GeneralFeed() {
  const posts = await prisma.post.findMany({
    take: INFINITE_SCROLLING_PAGE_SIZE,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      community: true,
    },
  });

  return <PostFeed initialPosts={posts} />;
}
